## /models/schemas.py
from pydantic import BaseModel
from typing import Optional, Literal

class MoveRequest(BaseModel):
    point: str
    speedj: Optional[int] = 10
    accj: Optional[int] = 10

class GripRequest(BaseModel):
    action: Literal['open', 'close']

class RobotStatus(BaseModel):
    mode: int
    last_response: str