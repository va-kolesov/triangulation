import React, { useState } from "react";
import "./App.css";
import SvgCanvas from "./SvgCanvas";
import {
    addPoints,
    addRandomPoints as addRandom,
    buildTriangulation,
    initialize,
    stepTriangulation,
} from "./Triangulation";

const [initPoints, initTriangles] = initialize();

const App = () => {
    const [state, setState] = useState(0);
    const [showCache, setShowCache] = useState(false);
    const [points, setPoints] = useState(initPoints);
    const [triangles, setTriangles] = useState(initTriangles);
    const addPoint = (point) => {
        if (state < 2) {
            const newPoints = addPoints(point);
            setPoints([...newPoints]);
            if (newPoints.length >= 7) {
                setState(1);
            }
        }
    };
    const triangulate = (finish) => {
        const newTriangles = buildTriangulation(finish);
        setTriangles([...newTriangles]);
        if (finish) {
            setState(2);
        }
    };
    const nextPoint = () => {
        const newTriangles = stepTriangulation();
        setTriangles([...newTriangles]);
    };
    const reset = () => {
        const [initPoints, initTriangles] = initialize();
        setTriangles([...initTriangles]);
        setPoints([...initPoints]);
        setState(0);
    };
    const switchCacheDisplay = () => {
        setShowCache(!showCache);
    };
    const addRandomPoints = (count) => {
        const newPoints = addRandom(count);
        setPoints([...newPoints]);
        if (newPoints.length >= 7) {
            setState(1);
        }
    };
    return (
        <div className="App">
            <SvgCanvas
                showCache={showCache}
                triangles={triangles}
                points={points}
                onClick={addPoint}
            />
            <div className="toolbar">
                <button disabled={state === 2} onClick={() => addRandomPoints(10)}>
                    Добавить 10 случайных точек
                </button>
                <button disabled={state === 2} onClick={() => addRandomPoints(100)}>
                    Добавить 100 случайных точек
                </button>
                <button disabled={state === 2} onClick={() => addRandomPoints(1000)}>
                    Добавить 1000 случайных точек
                </button>
                <button disabled={state !== 1} onClick={nextPoint}>
                    Обработать следующую точку
                </button>
                <button disabled={state !== 1} onClick={() => triangulate(false)}>
                    Триангуляция
                </button>
                <button disabled={state !== 1} onClick={() => triangulate(true)}>
                    Триангуляция (окончательная)
                </button>
                <button onClick={reset}>Сброс</button>
                <button onClick={switchCacheDisplay}>
                    {showCache
                        ? "Подсвечивать соседние треугольники"
                        : "Подсвечивать кэш"}
                </button>
            </div>
        </div>
    );
};

export default App;
