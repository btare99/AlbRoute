import fs from 'fs';
import path from 'path';

const shapesFile = 'c:/Users/user/Desktop/VS-projects/project/clothing-ecommerce/.gemini/temp_gtfs/shapes.txt';
const tripsFile = 'c:/Users/user/Desktop/VS-projects/project/clothing-ecommerce/.gemini/temp_gtfs/trips.txt';
const routesFile = 'c:/Users/user/Desktop/VS-projects/project/clothing-ecommerce/.gemini/temp_gtfs/routes.txt';

async function extractShapes() {
    // 1. Get route mapping: route_short_name -> route_id
    const routes = fs.readFileSync(routesFile, 'utf-8').split('\n').slice(1);
    const nameToId = {};
    routes.forEach(line => {
        const parts = line.split(',');
        if (parts.length > 2) {
            nameToId[parts[2]] = parts[0];
        }
    });

    // 2. Get trip mapping: route_id -> { direction_0: shape_id, direction_1: shape_id }
    const trips = fs.readFileSync(tripsFile, 'utf-8').split('\n').slice(1);
    const routeToShapes = {};
    trips.forEach(line => {
        const parts = line.split(',');
        if (parts.length > 7) {
            const rid = parts[0];
            const dir = parts[5]; // direction_id
            const sid = parts[7]; // shape_id
            if (!routeToShapes[rid]) routeToShapes[rid] = {};
            if (!routeToShapes[rid][dir]) routeToShapes[rid][dir] = sid;
        }
    });

    // 3. Get shape data: shape_id -> coordinates
    const shapes = fs.readFileSync(shapesFile, 'utf-8').split('\n').slice(1);
    const shapeData = {};
    shapes.forEach(line => {
        const parts = line.split(',');
        if (parts.length > 3) {
            const sid = parts[0];
            const lat = parseFloat(parts[2]);
            const lon = parseFloat(parts[3]);
            if (!shapeData[sid]) shapeData[sid] = [];
            shapeData[sid].push([lat, lon]);
        }
    });

    // 4. Combine into final mapping for useStore.ts
    const finalShapes = {};
    const appToGtfs = {
        'L11': '11',
        'L12': '12A',
        'L1A': '1A',
        'L1B': '1B',
        'L2': '2',
        'L3A': '3A',
        'L3B': '3B',
        'L3C': '3C',
        'L4': '4',
        'L5A': '5A',
        'L5B': '5B',
        'L6': '6',
        'L8A': '8A',
        'L8B': '8B',
        'L8C': '8C',
        'L9A': '9A',
        'L9B': '9B',
        'L10A': '10A',
        'L10B': '10B',
        'L10C': '10C',
        'L13A': '13A',
        'L13B': '13B',
        'L15A': '15A',
        'L15B': '15B',
        'L16A': '16A',
        'L16B': '16B'
    };

    Object.entries(appToGtfs).forEach(([appId, gtfsName]) => {
        const rid = nameToId[gtfsName];
        const shapesForRoute = routeToShapes[rid];
        console.log(`Mapping ${appId} (GTFS: ${gtfsName}, RID: ${rid}):`, shapesForRoute ? Object.keys(shapesForRoute) : 'None');
        if (shapesForRoute) {
            if (shapesForRoute['0']) finalShapes[`${appId}_0`] = shapeData[shapesForRoute['0']];
            if (shapesForRoute['1']) finalShapes[`${appId}_1`] = shapeData[shapesForRoute['1']];
            
            // Fallback for single direction
            if (!finalShapes[`${appId}_0`] && !finalShapes[`${appId}_1`]) {
                 const firstSid = Object.values(shapesForRoute)[0];
                 finalShapes[`${appId}_0`] = shapeData[firstSid];
            }
        }
    });

    const outputContent = `export const BUS_SHAPES: Record<string, [number, number][]> = ${JSON.stringify(finalShapes, null, 2)};`;
    fs.writeFileSync('c:/Users/user/Desktop/VS-projects/project/clothing-ecommerce/app/store/busShapes.ts', outputContent);
    console.log('Shapes extracted to app/store/busShapes.ts');
}

extractShapes();
