import anthropic
import json
from typing import TypedDict, List, Annotated
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from langchain_groq import ChatGroq
from agents.roles import AGENT_ROLES


# --- State definition ---
class AgentState(TypedDict):
    task: str
    user_id: str
    task_id: str
    ceo_plan: dict
    research_output: str
    analysis_output: str
    code_output: str
    written_output: str
    qa_result: dict
    messages: List[dict]
    current_agent: str
    completed_agents: List[str]
    final_output: str


# --- Model factory ---
def get_model(model_name: str):
    if model_name == "claude-haiku-4-5":
        return ChatAnthropic(model="claude-haiku-4-5-20251001", max_tokens=2048)
    elif model_name == "claude-sonnet-4-6":
        return ChatAnthropic(model="claude-sonnet-4-6", max_tokens=4096)
    else:
        return ChatGroq(model="llama-3.3-70b-versatile", max_tokens=2048)


# --- Agent node factory ---
def make_agent_node(role: str, model_name: str = "claude-haiku-4-5"):
    def agent_node(state: AgentState) -> AgentState:
        role_config = AGENT_ROLES[role]
        model = get_model(model_name)
        messages = [
            {"role": "system", "content": role_config["system_prompt"]},
            {
                "role": "user",
                "content": (
                    f"Task: {state['task']}\n\n"
                    "Context from previous agents:\n"
                    f"{json.dumps(state.get('messages', [])[-3:], indent=2)}"
                ),
            },
        ]
        response = model.invoke(messages)
        output = response.content
        new_message = {"agent": role, "output": output, "timestamp": "now"}
        return {
            **state,
            f"{role}_output": output,
            "current_agent": role,
            "completed_agents": state.get("completed_agents", []) + [role],
            "messages": state.get("messages", []) + [new_message],
        }

    return agent_node


# --- CEO routing logic ---
def ceo_router(state: AgentState) -> str:
    plan = state.get("ceo_plan", {})
    subtasks = plan.get("subtasks", [])
    completed = state.get("completed_agents", [])
    for subtask in subtasks:
        agent = subtask.get("assign_to")
        if agent and agent not in completed and agent != "ceo":
            return agent
    return "qa"


# --- Build the graph ---
def build_agent_graph():
    workflow = StateGraph(AgentState)

    # Add nodes for each agent
    workflow.add_node("ceo", make_agent_node("ceo", "claude-sonnet-4-6"))
    workflow.add_node("manager", make_agent_node("manager", "claude-haiku-4-5"))
    workflow.add_node("researcher", make_agent_node("researcher", "claude-haiku-4-5"))
    workflow.add_node("analyst", make_agent_node("analyst", "claude-sonnet-4-6"))
    workflow.add_node("coder", make_agent_node("coder", "claude-haiku-4-5"))
    workflow.add_node("writer", make_agent_node("writer", "claude-haiku-4-5"))
    workflow.add_node("qa", make_agent_node("qa", "claude-haiku-4-5"))

    # Entry point
    workflow.set_entry_point("ceo")

    # CEO decides who goes next
    workflow.add_conditional_edges(
        "ceo",
        ceo_router,
        {
            "researcher": "researcher",
            "analyst": "analyst",
            "coder": "coder",
            "writer": "writer",
            "manager": "manager",
            "qa": "qa",
        },
    )

    # After each agent, route back to CEO for next delegation or go to QA
    for agent in ["researcher", "analyst", "coder", "writer", "manager"]:
        workflow.add_conditional_edges(
            agent,
            ceo_router,
            {
                "researcher": "researcher",
                "analyst": "analyst",
                "coder": "coder",
                "writer": "writer",
                "manager": "manager",
                "qa": "qa",
            },
        )

    workflow.add_edge("qa", END)
    return workflow.compile()


AGENT_GRAPH = build_agent_graph()


# --- Main run function (used by API) ---
async def run_agents(task: str, user_id: str, task_id: str):
    initial_state = AgentState(
        task=task,
        user_id=user_id,
        task_id=task_id,
        ceo_plan={},
        research_output="",
        analysis_output="",
        code_output="",
        written_output="",
        qa_result={},
        messages=[],
        current_agent="",
        completed_agents=[],
        final_output="",
    )
    async for chunk in AGENT_GRAPH.astream(initial_state):
        yield chunk
