from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta

app = FastAPI(title="Amdox ERP AI Forecasting Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DataPoint(BaseModel):
    date: str  # YYYY-MM-DD
    quantity: float

class ForecastRequest(BaseModel):
    history: List[DataPoint]
    periods: int = 7  # Number of days to forecast

class ForecastResponsePoint(BaseModel):
    date: str
    quantity: float
    type: str  # 'historical' or 'forecast'

class ForecastResponse(BaseModel):
    status: str
    forecast: List[ForecastResponsePoint]

@app.get("/")
def read_root():
    return {
        "status": "success",
        "service": "Amdox ERP AI Service",
        "endpoints": {
            "/api/forecast": "POST - demand forecasting"
        }
    }

@app.post("/api/forecast", response_model=ForecastResponse)
def generate_forecast(payload: ForecastRequest):
    if len(payload.history) < 3:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient historical data. Provide at least 3 historical points."
        )
    
    try:
        # Load history into DataFrame
        df = pd.DataFrame([p.dict() for p in payload.history])
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Feature engineering: convert dates to integer ordinals
        df['ordinal'] = df['date'].apply(lambda x: x.toordinal())
        
        # Fit LinearRegression model
        X = df[['ordinal']].values
        y = df['quantity'].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Generate predictions
        last_date = df['date'].max()
        forecast_points = []
        
        # Add historical points
        for _, row in df.iterrows():
            forecast_points.append(
                ForecastResponsePoint(
                    date=row['date'].strftime('%Y-%m-%d'),
                    quantity=float(row['quantity']),
                    type="historical"
                )
            )
            
        # Extrapolate forecast points
        for i in range(1, payload.periods + 1):
            next_date = last_date + timedelta(days=i)
            ordinal_val = next_date.toordinal()
            predicted_qty = model.predict([[ordinal_val]])[0]
            # Clip quantities to 0 so we don't return negative forecasts
            predicted_qty = max(0.0, float(predicted_qty))
            
            forecast_points.append(
                ForecastResponsePoint(
                    date=next_date.strftime('%Y-%m-%d'),
                    quantity=round(predicted_qty, 2),
                    type="forecast"
                )
            )
            
        return ForecastResponse(status="success", forecast=forecast_points)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting calculation failed: {str(e)}")
