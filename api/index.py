"""Stateless Python API, deployable as a Vercel Python function.

No user data is held in process memory. Stateful operations belong in Supabase
with authenticated user tokens and RLS (see supabase/schema.sql).
"""
from collections import OrderedDict
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Base Nutrition API", version="0.1.0", docs_url="/api/docs", openapi_url="/api/openapi.json")

class Ingredient(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    quantity: float = Field(gt=0, le=100000)
    unit: str = Field(min_length=1, max_length=20)
    category: str = Field(default="Outros", max_length=60)

class ShoppingRequest(BaseModel):
    days: int = Field(ge=1, le=14)
    ingredients: list[Ingredient] = Field(max_length=300)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "base", "version": "0.1.0"}

@app.post("/api/shopping-list")
def shopping_list(body: ShoppingRequest):
    items: OrderedDict[tuple[str, str], dict] = OrderedDict()
    for ingredient in body.ingredients:
        key = (ingredient.name.strip().casefold(), ingredient.unit.strip().casefold())
        if key not in items:
            items[key] = ingredient.model_dump()
            items[key]["quantity"] = 0
        items[key]["quantity"] = round(items[key]["quantity"] + ingredient.quantity * body.days, 4)
    return {"days": body.days, "items": list(items.values())}
