import React, { useState } from "react";
import {
    circumcircleCenter,
    circumcircleRadius,
    getCacheTriangle,
    getCache,
} from "./Triangulation";
const SIZE = 1000;
const Grid = ({ count }) => {
    const rects = [];
    const step = SIZE / count;
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
            viewBox="0 0 SIZE SIZE"
            width="SIZEpx"
            height="SIZEpx"
            onMouseMove={(e) => {
                const triangle = getCacheTriangle({
                    x: e.nativeEvent.offsetX,
                    y: e.nativeEvent.offsetY,
                });
                if (cacheTriangle !== triangle) {
                    setCacheTriangle(triangle || null);
                }
            }}
        >
            <Grid count={cacheSize} />
            {cacheTriangle && (
                <polygon
                    className="alt"
                    points={cacheTriangle.points
                        .map((point) => `${point.x},${point.y}`)
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
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width={`${SIZE}px`}
            height={`${SIZE}px`}
            onClick={(e) =>
                onClick({
                    x: e.nativeEvent.offsetX,
                    y: e.nativeEvent.offsetY,
                })
            }
        >
            {triangles.map((triangle) => (
                <g key={triangle.key}>
                    <polygon
                        points={triangle.points
                            .map((point) => `${point.x},${point.y}`)
                            .join(" ")}
                        stroke="black"
                        strokeWidth=".5"
                    />
                    {!showCache && (
                        <circle
                            className="circle"
                            cx={circumcircleCenter(triangle).x}
                            cy={circumcircleCenter(triangle).y}
                            r={circumcircleRadius(triangle)}
                            stroke="black"
                            fill="none"
                            strokeWidth=".75"
                        />
                    )}
                    {!showCache &&
                        triangle.adjacent.map((atr, index) => (
                            <polygon
                                className="alt"
                                key={index}
                                points={atr.points
                                    .map((point) => `${point.x},${point.y}`)
                                    .join(" ")}
                            />
                        ))}
                </g>
            ))}
            {points.map(({ x, y }, index) => (
                <circle key={index} cx={x} cy={y} r={2} fill="black" />
            ))}
            {showCache && <Cache />}
        </svg>
    );
};

export default SvgCanvas;
