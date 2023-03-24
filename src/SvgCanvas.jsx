import React, { useState } from "react";
import {
    circumcircleCenter,
    circumcircleRadius,
    triangleMidPoint,
    getCacheTriangle
} from "./Triangulation";

const SvgCanvas = ({ triangles = [], points = [], onClick, showCache = false }) => {
    const [cacheTriangle, setCacheTriangle] = useState(null);
    return (
        <svg
            className={`diagram ${showCache ? 'showCache' : 'showAdjacent'}`}
            viewBox="0 0 1000 1000"
            width="1000px"
            height="1000px"
            onClick={(e) =>
                onClick({
                    x: e.nativeEvent.offsetX,
                    y: e.nativeEvent.offsetY,
                })
            }
            onMouseMove={(e) => {
                if (showCache) {
                    const triangle = getCacheTriangle({
                        x: e.nativeEvent.offsetX,
                        y: e.nativeEvent.offsetY,
                    });
                    setCacheTriangle(triangle || null);
                }
            }}
        >
            {triangles.map((triangle, index) => (
                <g key={triangle.key}>
                    <polygon
                        points={triangle.points
                            .map((point) => `${point.x},${point.y}`)
                            .join(" ")}
                        stroke="black"
                        strokeWidth=".5"
                    />
                    {!showCache && <circle
                        className="circle"
                        cx={circumcircleCenter(triangle).x}
                        cy={circumcircleCenter(triangle).y}
                        r={circumcircleRadius(triangle)}
                        stroke="black"
                        fill="none"
                        strokeWidth=".75"
                    />}
                    {!showCache && triangle.adjacent.map((atr, index) => (
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
            {showCache && cacheTriangle && (
                <polygon
                    className="alt"
                    points={cacheTriangle.points
                        .map((point) => `${point.x},${point.y}`)
                        .join(" ")}
                />
            )}
        </svg>
    );
};

export default SvgCanvas;
