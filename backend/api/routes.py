from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from agents.orchestrator import run_agents
import json, asyncio

router = APIRouter()


class TaskRequest(BaseModel):
    task: str
    user_id: str
    user_plan: str = "free"
    selected_agents: list[str] = []


class AgentCreate(BaseModel):
    name: str
    role: str
    system_prompt: str
    model: str
    tools: list[str]
    color: str
    icon: str


# --- Stream task execution ---
@router.post("/tasks/run")
async def run_task(req: TaskRequest):
    async def event_stream():
        task_id = f"task_{req.user_id}_{int(asyncio.get_event_loop().time())}"
        try:
            async for chunk in run_agents(req.task, req.user_id, task_id, req.user_plan):
                event_data = {
                    "type": "agent_update",
                    "task_id": task_id,
                    "data": chunk
                }
                yield f"data: {json.dumps(event_data)}\n\n"
            yield f"data: {json.dumps({'type': 'complete', 'task_id': task_id})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# --- Agent CRUD ---
@router.get("/agents/{user_id}")
async def get_agents(user_id: str):
    from db.supabase_client import supabase
    result = supabase.table("agents").select("*").eq("user_id", user_id).execute()
    return result.data


@router.post("/agents/{user_id}")
async def create_agent(user_id: str, agent: AgentCreate):
    from db.supabase_client import supabase
    data = agent.dict()
    data["user_id"] = user_id
    result = supabase.table("agents").insert(data).execute()
    return result.data[0]


@router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str):
    from db.supabase_client import supabase
    supabase.table("agents").delete().eq("id", agent_id).execute()
    return {"deleted": True}


# --- Task history ---
@router.get("/tasks/{user_id}")
async def get_tasks(user_id: str):
    from db.supabase_client import supabase
    result = (
        supabase.table("tasks")
        .select("*, agent_outputs(*)")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )
    return result.data
