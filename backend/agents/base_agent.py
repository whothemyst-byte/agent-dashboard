from dataclasses import dataclass, field
from typing import Any, Dict, List


@dataclass
class BaseAgent:
    id: str
    name: str
    role: str
    system_prompt: str
    model: str = "claude-haiku-4-5"
    tools: List[str] = field(default_factory=list)

    async def run(self, task: Dict[str, Any]) -> Dict[str, Any]:
        content = (
            f"{self.name} handled task '{task.get('title', 'Untitled')}' "
            f"with role '{self.role}'."
        )
        return {
            "agent_id": self.id,
            "agent_name": self.name,
            "agent_role": self.role,
            "content": content,
            "tokens_used": 0,
        }
