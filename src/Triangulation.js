"strict mode";
const WIDTH = 1000;
const HEIGHT = 1000;
const PADDING = 1;

let POINTS;
let TRIANGLES;
let CACHE;
let TRIANGLES_TO_CHECK;
let lastHandledPointIndex;

let counter = 0;
const R = 3;

function createTriangle(points) {
    return {
        key: counter++,
        points,
        adjacent: [],
        circumcircleCenter: null,
        circumcircleRadius: null,
        midPoint: null,
    };
}

/**
 * Инициализация алгоритма:
 * Добавление вспомогательных точек - прямоугольник, содержащий все остальные точки;
 * Начальная триангуляция на вспомогательном прямоугольнике;
 * Заполнение начального кэша;
 */
export function initialize() {
    counter = 0;
    POINTS = [
        { x: -PADDING, y: -PADDING, helping: true },
        { x: -PADDING, y: HEIGHT + PADDING, helping: true },
        { x: WIDTH + PADDING, y: -PADDING, helping: true },
        { x: WIDTH + PADDING, y: HEIGHT + PADDING, helping: true },
    ];
    lastHandledPointIndex = POINTS.length - 1;
    TRIANGLES_TO_CHECK = [];
    resetTriangulationAndCache();
    return [POINTS, TRIANGLES];
}

/**
 * Сброс триангуляции:
 * Начальная триангуляция на вспомогательном прямоугольнике;
 * Заполнение начального кэша;
 */
function resetTriangulationAndCache() {
    TRIANGLES = [];
    TRIANGLES.push(createTriangle([POINTS[0], POINTS[1], POINTS[2]])),
        TRIANGLES.push(createTriangle([POINTS[1], POINTS[2], POINTS[3]]));
    TRIANGLES[0].adjacent.push(TRIANGLES[1]);
    TRIANGLES[1].adjacent.push(TRIANGLES[0]);
    CACHE = [
        [TRIANGLES[0], TRIANGLES[0]],
        [TRIANGLES[1], TRIANGLES[1]],
    ];
}

/**
 * Добавление точек в триангулируемое множество.
 * Перестроение триангуляции автоматически не происходит.
 * @param  {...any} points
 */
export function addPoints(...points) {
    POINTS.push(
        ...points.filter(
            (p) => !POINTS.find((p1) => p1.x === p.x && p1.y === p.y)
        )
    );
    return POINTS;
}

export function addRandomPoints(count) {
    const points = Array.from({ length: count }, () => ({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
    }));
    return addPoints(...points);
}

/**
 * Построение триангуляции по данным точкам.
 * Возвращает массив треугольников.
 */
export function buildTriangulation(finish) {
    while (lastHandledPointIndex < POINTS.length - 1) {
        stepTriangulation();
    }
    if (finish) {
        removeHelpingPoints();
    }
    return [POINTS, TRIANGLES];
}

/**
 * Шаг алгоритма триангуляции относительно новой точки.
 * Возвращает массив треугольников.
 */
export function stepTriangulation() {
    const point = POINTS[lastHandledPointIndex + 1];
    if (point) {
        const triangle = locatePoint(point);
        splitTriangle(triangle, point);
        checkTriangles();
        lastHandledPointIndex += 1;
    } else {
        alert("Все точки обработаны");
    }
    if (lastHandledPointIndex > R * CACHE.length * CACHE.length) {
        doubleCache();
    }
    return TRIANGLES;
}

function splitTriangle(triangle, point) {
    const side1 = [triangle.points[0], triangle.points[1]];
    const side2 = [triangle.points[1], triangle.points[2]];
    const side3 = [triangle.points[2], triangle.points[0]];

    const newTriangle1 = createTriangle([...side1, point]);
    const newTriangle2 = createTriangle([...side2, point]);
    const newTriangle3 = createTriangle([...side3, point]);

    newTriangle1.adjacent.push(
        ...triangle.adjacent.filter((tr) =>
            side1.every((p) => tr.points.find((pp) => pp === p))
        )
    );
    if (newTriangle1.adjacent[0]) {
        const originalIndex = newTriangle1.adjacent[0].adjacent.findIndex(
            (tr) => tr === triangle
        );
        newTriangle1.adjacent[0].adjacent.splice(
            originalIndex,
            1,
            newTriangle1
        );
        TRIANGLES_TO_CHECK.push([newTriangle1, newTriangle1.adjacent[0]]);
    }
    newTriangle1.adjacent.push(newTriangle2, newTriangle3);

    newTriangle2.adjacent.push(
        ...triangle.adjacent.filter((tr) =>
            side2.every((p) => tr.points.find((pp) => pp === p))
        )
    );
    if (newTriangle2.adjacent[0]) {
        const originalIndex = newTriangle2.adjacent[0].adjacent.findIndex(
            (tr) => tr === triangle
        );
        newTriangle2.adjacent[0].adjacent.splice(
            originalIndex,
            1,
            newTriangle2
        );

        TRIANGLES_TO_CHECK.push([newTriangle2, newTriangle2.adjacent[0]]);
    }
    newTriangle2.adjacent.push(newTriangle1, newTriangle3);

    newTriangle3.adjacent.push(
        ...triangle.adjacent.filter((tr) =>
            side3.every((p) => tr.points.find((pp) => pp === p))
        )
    );
    if (newTriangle3.adjacent[0]) {
        const originalIndex = newTriangle3.adjacent[0].adjacent.findIndex(
            (tr) => tr === triangle
        );
        newTriangle3.adjacent[0].adjacent.splice(
            originalIndex,
            1,
            newTriangle3
        );
        TRIANGLES_TO_CHECK.push([newTriangle3, newTriangle3.adjacent[0]]);
    }
    newTriangle3.adjacent.push(newTriangle2, newTriangle1);

    removeTriangle(triangle, newTriangle1);

    TRIANGLES.push(newTriangle1, newTriangle2, newTriangle3);

    setCacheTriangle(point, newTriangle1);
}

function checkTriangles() {
    while (TRIANGLES_TO_CHECK.length > 0) {
        if (!isDelaunay(...TRIANGLES_TO_CHECK[0])) {
            flip(...TRIANGLES_TO_CHECK[0]);
        }
        TRIANGLES_TO_CHECK.splice(0, 1);
    }
}

function flip(t1, t2) {
    // Находим общие вершины двух треугольников
    const commonPoints = t1.points.filter(
        (p1) => !!t2.points.find((p2) => p1 === p2)
    );

    // Находим оставшуюся вершину первого треугольника
    const t1p = t1.points.filter(
        (p) => !commonPoints.find((p1) => p1 === p)
    )[0];

    // Находим оставшуюся вершину второго треугольника
    const t2p = t2.points.filter(
        (p) => !commonPoints.find((p1) => p1 === p)
    )[0];

    const newTriangle1 = createTriangle([commonPoints[0], t1p, t2p]);

    const newTriangle2 = createTriangle([commonPoints[1], t1p, t2p]);

    const adjacent = [...t1.adjacent, ...t2.adjacent].filter(
        (t) => t !== t1 && t !== t2
    );
    adjacent.forEach((t) => {
        if (isAdjacent(t, t1)) {
            t.adjacent.splice(
                t.adjacent.findIndex((tt) => tt === t1),
                1
            );
        } else {
            t.adjacent.splice(
                t.adjacent.findIndex((tt) => tt === t2),
                1
            );
        }
        if (isAdjacent(t, newTriangle1)) {
            newTriangle1.adjacent.push(t);
            t.adjacent.push(newTriangle1);
            TRIANGLES_TO_CHECK.push([t, newTriangle1]);
        } else {
            newTriangle2.adjacent.push(t);
            t.adjacent.push(newTriangle2);
            TRIANGLES_TO_CHECK.push([t, newTriangle2]);
        }
    });
    newTriangle1.adjacent.push(newTriangle2);
    newTriangle2.adjacent.push(newTriangle1);

    removeTriangle(t1, newTriangle1);
    removeTriangle(t2, newTriangle2);
    TRIANGLES.push(newTriangle1, newTriangle2);

    setCacheTriangle(POINTS[lastHandledPointIndex + 1], newTriangle1);
}

function removeTriangle(triangle, replaceTriangle) {
    let originalIndex = TRIANGLES.findIndex((tr) => tr === triangle);
    TRIANGLES.splice(originalIndex, 1);
    for (let i = 0; i < CACHE.length; i++) {
        CACHE[i] = CACHE[i].map((e) => (e === triangle ? replaceTriangle : e));
    }
}

/**
 * Определение положения точки в триангуляции.
 */
function locatePoint(point) {
    let startTriangle;
    if (distance(point, POINTS[lastHandledPointIndex]) > WIDTH/CACHE.length) {
        startTriangle = getCacheTriangle(point);
    } else {
        startTriangle = TRIANGLES[TRIANGLES.length - 1];
    }
    const locatedTriangle = findNextClosestTriangle(point, startTriangle);
    return locatedTriangle;
}

export function removeHelpingPoints() {
    TRIANGLES = TRIANGLES.filter(({ points }) =>
        points.every((p) => !p.helping)
    );
    TRIANGLES.forEach((triangle) => {
        triangle.adjacent = triangle.adjacent.filter(({ points }) =>
            points.every((p) => !p.helping)
        );
    });
    POINTS = POINTS.filter((p) => !p.helping);
    return [POINTS, TRIANGLES];
}

/**
 * Поиск точки в триангуляции.
 */
let searchPath = [];
function findNextClosestTriangle(point, triangle) {
    searchPath.push(triangle);
    if (isInsideTriangle(point, triangle)) {
        searchPath = [];
        return triangle;
    } else {
        let closestTriangle = null;
        let closestTriangleDist = Infinity;
        triangle.adjacent
            .filter((tr) => !searchPath.find((ptr) => tr === ptr))
            .forEach((tr) => {
                const dist = shortestDistanceToTriangle(point, tr);
                if (dist < closestTriangleDist) {
                    closestTriangle = tr;
                    closestTriangleDist = dist;
                }
            });
        return findNextClosestTriangle(point, closestTriangle);
    }
}

function shortestDistanceToTriangle({ x, y }, { points }) {
    var v0 = [points[2].x - points[0].x, points[2].y - points[0].y];
    var v1 = [points[1].x - points[0].x, points[1].y - points[0].y];
    var v2 = [x - points[0].y, y - points[0].y];

    var dot00 = dotProduct(v0, v0);
    var dot01 = dotProduct(v0, v1);
    var dot02 = dotProduct(v0, v2);
    var dot11 = dotProduct(v1, v1);
    var dot12 = dotProduct(v1, v2);

    var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    if (u >= 0 && v >= 0 && u + v <= 1) {
        return 0;
    }

    var dist = [
        distancePointToLine(x, y, points[0], points[1]),
        distancePointToLine(x, y, points[1], points[2]),
        distancePointToLine(x, y, points[2], points[0]),
    ];
    return Math.min.apply(null, dist);
}

function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

function distancePointToLine(x, y, point1, point2) {
    var A = x - point1.x;
    var B = y - point1.y;
    var C = point2.x - point1.x;
    var D = point2.y - point1.y;

    var dot = A * C + B * D;
    var lenSq = C * C + D * D;
    var param = dot / lenSq;

    var xx, yy;

    if (param < 0) {
        xx = point1.x;
        yy = point1.y;
    } else if (param > 1) {
        xx = point2.x;
        yy = point2.y;
    } else {
        xx = point1.x + param * C;
        yy = point1.y + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Проверка принадлежности точки треугольнику
 * Ради эксперимента, функция от chatGPT
 * @param {*} point
 * @param {*} triangle
 * @returns
 */
function isInsideTriangle(point, triangle) {
    const [p1, p2, p3] = triangle.points;

    // Вычисляем площадь треугольника
    const area =
        0.5 *
        (-p2.y * p3.x +
            p1.y * (-p2.x + p3.x) +
            p1.x * (p2.y - p3.y) +
            p2.x * p3.y);

    // Вычисляем координаты барицентрических координат точки
    const s =
        (1 / (2 * area)) *
        (p1.y * p3.x -
            p1.x * p3.y +
            (p3.y - p1.y) * point.x +
            (p1.x - p3.x) * point.y);
    const t =
        (1 / (2 * area)) *
        (p1.x * p2.y -
            p1.y * p2.x +
            (p1.y - p2.y) * point.x +
            (p2.x - p1.x) * point.y);

    // Точка лежит внутри треугольника, если ее барицентрические координаты положительны и их сумма равна 1
    return s > 0 && t > 0 && 1 - s - t > 0;
}

function isAdjacent(t1, t2) {
    const commonPoints = t1.points.filter(
        (p1) => !!t2.points.find((p2) => p1 === p2)
    );
    return commonPoints.length === 2;
}

/**
 * Проверка условия Делоне для пары треугольников
 * @param {*} t1
 * @param {*} t2
 * @returns
 */
function isDelaunay(t1, t2) {
    // Находим общие вершины двух треугольников
    const commonPoints = t1.points.filter(
        (p1) => !!t2.points.find((p2) => p1 === p2)
    );

    // Находим оставшуюся вершину первого треугольника
    const t1p = t1.points.filter(
        (p) => !commonPoints.find((p1) => p1 === p)
    )[0];

    // Находим оставшуюся вершину второго треугольника
    const t2p = t2.points.filter(
        (p) => !commonPoints.find((p1) => p1 === p)
    )[0];

    // Вычисляем радиусы окружностей, описанных вокруг треугольников
    const r1 = circumcircleRadius(t1);
    const r2 = circumcircleRadius(t2);

    // Вычисляем центры окружностей, описанных вокруг треугольников
    const c1 = circumcircleCenter(t1);
    const c2 = circumcircleCenter(t2);

    // Проверяем, лежит ли третья вершина первого треугольника в окружности, описанной вокруг второго треугольника
    const inCircle1 = isPointInsideCircle(t1p, c2, r2);

    // Проверяем, лежит ли третья вершина второго треугольника в окружности, описанной вокруг первого треугольника
    const inCircle2 = isPointInsideCircle(t2p, c1, r1);

    // Условие Делоне выполняется, если обе вершины не лежат в окружности, описанной вокруг другого треугольника
    return !inCircle1 && !inCircle2;
}

// Функция вычисляет радиус окружности, описанной вокруг треугольника
export function circumcircleRadius(triangle) {
    if (triangle.circumcircleRadius === null) {
        const [p1, p2, p3] = triangle.points;
        const a = distance(p1, p2);
        const b = distance(p2, p3);
        const c = distance(p3, p1);
        const p = (a + b + c) / 2;
        triangle.circumcircleRadius =
            (a * b * c) / (4 * Math.sqrt(p * (p - a) * (p - b) * (p - c)));
    }
    return triangle.circumcircleRadius;
}

// Функция вычисляет расстояние между двумя точками
function distance(p1, p2) {
    const a = p2.x - p1.x;
    const b = p2.y - p1.y;
    return Math.sqrt(a * a + b * b);
}

// Функция вычисляет центр окружности, описанной вокруг треугольника
export function circumcircleCenter(triangle) {
    if (triangle.circumcircleCenter === null) {
        const [p1, p2, p3] = triangle.points;
        const a = p2.x - p1.x;
        const b = p2.y - p1.y;
        const c = p3.x - p1.x;
        const d = p3.y - p1.y;
        const e = a * (p1.x + p2.x) + b * (p1.y + p2.y);
        const f = c * (p1.x + p3.x) + d * (p1.y + p3.y);
        const g = 2 * (a * (p3.y - p2.y) - b * (p3.x - p2.x));
        if (g === 0) {
            // Треугольник вырожденный
            return null;
        }
        const centerX = (d * e - b * f) / g;
        const centerY = (a * f - c * e) / g;
        triangle.circumcircleCenter = { x: centerX, y: centerY };
    }
    return triangle.circumcircleCenter;
}

// Функция проверяет, лежит ли точка p внутри окружности с центром c и радиусом r, описанной вокруг треугольника с вершинами p1 и p2
function isPointInsideCircle(p, c, r) {
    const d = distance(c, p);
    // Точка лежит внутри окружности, если ее расстояние до центра меньше радиуса
    // и точка не лежит внутри треугольника, все вершины которого находятся на окружности
    return d < r;
}

export function triangleMidPoint(triangle) {
    if (triangle.midPoint === null) {
        const [a, b, c] = triangle.points;
        triangle.midPoint = {
            x: (a.x + b.x + c.x) / 3,
            y: (a.y + b.y + c.y) / 3,
        };
    }
    return triangle.midPoint;
}

/**
 * Поиск точки в кэше.
 */
export function getCacheTriangle({ x, y }) {
    const i = Math.max(
        0,
        Math.min(Math.floor((x / WIDTH) * CACHE.length), CACHE.length - 1)
    );
    const j = Math.max(
        0,
        Math.min(Math.floor((y / HEIGHT) * CACHE[0].length), CACHE.length - 1)
    );
    let triangle = CACHE[i][j];
    return triangle;
}

/**
 * Поиск точки в кэше.
 */
function setCacheTriangle({ x, y }, triangle) {
    const i = Math.max(
        0,
        Math.min(Math.floor((x / WIDTH) * CACHE.length), CACHE.length - 1)
    );
    const j = Math.max(
        0,
        Math.min(Math.floor((y / HEIGHT) * CACHE[0].length), CACHE.length - 1)
    );
    CACHE[i][j] = triangle;
}

/**
 * Удвоение кэша.
 */
function doubleCache() {
    const oldCache = CACHE;
    CACHE = [];
    oldCache.forEach((row, i) => {
        CACHE.push([], []);
        row.forEach((col) => {
            CACHE[i * 2].push(col, col);
            CACHE[i * 2 + 1].push(col, col);
        });
    });
}

export function getCache() {
    return CACHE;
}
