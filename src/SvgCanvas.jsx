import React, { useState } from "react";
import {
    circumcircleCenter,
    circumcircleRadius,
    getCacheTriangle,
    getCache,
} from "./Triangulation";
import "./SvgCanvas.css";
const SCALE = 1000;
const Grid = ({ count }) => {
    const rects = [];
    const step = SCALE / count;
    for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
            rects.push(
                <rect
                    key={`${i}-${j}`}
                    x={j * step}
                    y={i * step}
                    width={step}
                    height={step}
                    fill="transparent"
                    strokeWidth="0.25"
                    strokeDasharray="0 4 0"
                    stroke="black"
                />
            );
        }
    }
    return <>{rects}</>;
};

const Cache = () => {
    const [cacheTriangle, setCacheTriangle] = useState(null);

    const cacheSize = getCache().length;
    return (
        <g
            className={`diagram showCache`}
            onMouseMove={(e) => {
                const triangle = getCacheTriangle({
                    x: e.nativeEvent.offsetX / SCALE,
                    y: e.nativeEvent.offsetY / SCALE,
                });
                if (cacheTriangle !== triangle) {
                    setCacheTriangle(triangle || null);
                }
            }}
        >
            <Grid count={cacheSize} />
            {cacheTriangle && (
                <polygon
                    className="triangle alt"
                    points={cacheTriangle.points
                        .map((point) => `${point.x * SCALE},${point.y * SCALE}`)
                        .join(" ")}
                />
            )}
        </g>
    );
};

const SvgCanvas = ({
    triangles = [],
    points = [],
    onClick,
    showCache = false,
}) => {
    return (
        <svg
            className={`diagram ${showCache ? "" : "showAdjacent"}`}
            viewBox={`0 0 ${SCALE} ${SCALE}`}
            width="100%"
            height="100%"
            onClick={(e) =>
                onClick({
                    x: e.nativeEvent.offsetX / SCALE,
                    y: e.nativeEvent.offsetY / SCALE,
                })
            }
        >
            {triangles.map((triangle) => (
                <g key={triangle.key}>
                    <polygon
                        className="triangle normal"
                        points={triangle.points
                            .map(
                                (point) =>
                                    `${point.x * SCALE},${point.y * SCALE}`
                            )
                            .join(" ")}
                    />
                    {!showCache &&
                        triangle.adjacent.map((atr, index) => (
                            <polygon
                                className="triangle alt"
                                key={index}
                                points={atr.points
                                    .map(
                                        (point) =>
                                            `${point.x * SCALE},${
                                                point.y * SCALE
                                            }`
                                    )
                                    .join(" ")}
                            />
                        ))}
                    {!showCache && (
                        <circle
                            className="circle"
                            cx={circumcircleCenter(triangle).x * SCALE}
                            cy={circumcircleCenter(triangle).y * SCALE}
                            r={circumcircleRadius(triangle) * SCALE}
                        />
                    )}
                </g>
            ))}
            {points.map(({ x, y }, index) => (
                <circle
                    key={index}
                    cx={x * SCALE}
                    cy={y * SCALE}
                    r={1.5}
                    pointerEvents="none"
                    fill="black"
                />
            ))}
            {showCache && <Cache />}
        </svg>
    );
};

export default SvgCanvas;
