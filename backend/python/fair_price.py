"""
Optional companion to backend/src/services/fairPrice.js
Same weights, for judges who want to see a Python snippet.
This file is documentation + a CLI helper — the live API uses the Node engine.
"""

LEVEL = {"LOW": 0.25, "MEDIUM": 0.5, "HIGH": 0.85}
SEASON = {"summer": 0.04, "monsoon": -0.02, "winter": 0.01, "harvest": 0}


def recommend(product_name, listed, qty, current, historical, demand="HIGH", supply="MEDIUM", season="harvest"):
    blended = current * 0.45 + historical * 0.35 + current * 0.2
    demand_adj = (LEVEL[demand] - 0.5) * 0.14
    supply_adj = (0.5 - LEVEL[supply]) * 0.12
    season_adj = SEASON.get(season, 0)
    qty_adj = -0.04 if qty >= 250 else (-0.015 if qty >= 100 else (0.025 if 0 < qty < 40 else 0))
    mid = blended * (1 + demand_adj + supply_adj + season_adj + qty_adj)
    return round(mid * 0.96, 1), round(mid, 1), round(mid * 1.08, 1)


if __name__ == "__main__":
    lo, mid, hi = recommend("Tomato", 22, 100, 25, 23)
    print(f"Tomato recommended band ₹{lo}–₹{hi}/kg (mid ₹{mid})")
