import React, { useState } from "react";
import "./App.css";
import SvgCanvas from "./SvgCanvas";
import {
    addPoints,
    addRandomPoints as addRandom,
    addRandomPointsAlt as addRandomAlt,
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
        const [newPoints, newTriangles] = buildTriangulation(finish);
        setTriangles([...newTriangles]);
        setPoints([...newPoints]);
        if (finish) {
            setState(2);
        }
    };
    const nextPoint = (full = true) => {
        const newTriangles = stepTriangulation(full);
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
    const addRandomPoints = (count, alt) => {
        const newPoints = (alt ? addRandomAlt : addRandom)?.(count);
        setPoints([...newPoints]);
        if (newPoints.length >= 7) {
            setState(1);
        }
    };
    return (
        <div className="App">
            <div className="scroll">
                <div className="scroll-content">
                    <SvgCanvas
                        showCache={showCache}
                        triangles={triangles}
                        points={points}
                        onClick={addPoint}
                    />
                </div>
            </div>
            <div className="toolbar column">
                <div className="row">
                    <div className="column">
                        <button
                            disabled={state === 2}
                            onClick={() => addRandomPoints(10)}
                        >
                            Добавить 10 точек
                        </button>
                        <button
                            disabled={state === 2}
                            onClick={() => addRandomPoints(100)}
                        >
                            Добавить 100 точек
                        </button>
                        <button
                            disabled={state === 2}
                            onClick={() => addRandomPoints(1000)}
                        >
                            Добавить 1000 точек
                        </button>
                    </div>
                    <div className="column">
                        <button
                            disabled={state === 2}
                            onClick={() => addRandomPoints(10, 1)}
                        >
                            Добавить 10 точек в круге
                        </button>
                        <button
                            disabled={state === 2}
                            onClick={() => addRandomPoints(100, 1)}
                        >
                            Добавить 100 точек в круге
                        </button>
                        <button
                            disabled={state === 2}
                            onClick={() => addRandomPoints(1000, 1)}
                        >
                            Добавить 1000 точек в круге
                        </button>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <button disabled={state !== 1} onClick={nextPoint}>
                            Сделать шаг
                        </button>
                    </div>
                    <div className="column">
                        <button
                            disabled={state !== 1}
                            onClick={() => nextPoint(false)}
                        >
                            Пол шага
                        </button>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <button
                            disabled={state !== 1}
                            onClick={() => triangulate(false)}
                        >
                            Триангуляция
                        </button>
                    </div>
                    <div className="column">
                        <button
                            disabled={state !== 1}
                            onClick={() => triangulate(true)}
                        >
                            Триангуляция (окончательная)
                        </button>
                    </div>
                </div>
                <button onClick={reset}>Сброс</button>
                <button onClick={switchCacheDisplay}>
                    {showCache
                        ? "Подсвечивать соседние треугольники"
                        : "Подсвечивать кэш"}
                </button>
                <div className="info scroll">
                    <p>
                        Добавлено точек: {points.length}.{" "}
                        {state < 2 ? "(Из них 4 вспомогательные)" : ""}
                    </p>
                    <p>
                        Построено треугольников триангуляции: {triangles.length}
                        . {state < 2 ? "(Включая вспомогательные)" : ""}
                    </p>
                    {state < 2 && (
                        <p>Клик по диаграме добавляет точку в место клика.</p>
                    )}
                    {state === 2 && (
                        <p>
                            Построение триангуляции завершено, вспомогательные
                            точки и треугольники удалены.
                        </p>
                    )}
                    <p>
                        При наведении мыши{" "}
                        {showCache
                            ? "на пунктирный квадрат, подсвечивается связанный с ним треугольник из динамического кэша."
                            : "на треугольник, подсвечиваются его соседи и описывающая его окружность."}
                    </p>
                    <p>
                        Vadim Kolesov, 2023 |{" "}
                        <a href="https://github.com/va-kolesov/triangulation">
                            source
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default App;
