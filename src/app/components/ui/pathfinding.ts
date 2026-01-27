import L from 'leaflet';

interface Point { lat: number; lng: number }
interface GraphNode { id: string; lat: number; lng: number; neighbors: { nodeId: string; dist: number }[] }

// Helper: Calculate distance
function getDist(p1: Point, p2: Point) {
  return L.latLng(p1.lat, p1.lng).distanceTo(L.latLng(p2.lat, p2.lng));
}

// THE BRAIN: Connects your paths into a network
export function buildGraphAndFindPath(
  userPos: Point, 
  destPos: Point, 
  allPaths: Point[][]
): Point[] {
  
  const nodes: GraphNode[] = [];
  const SNAP_DISTANCE = 15; // 15 meters tolerance

  function getOrCreateNode(p: Point): string {
    const existing = nodes.find(n => getDist(n, p) < SNAP_DISTANCE);
    if (existing) return existing.id;
    const id = `node_${nodes.length}`;
    nodes.push({ id, lat: p.lat, lng: p.lng, neighbors: [] });
    return id;
  }

  // Build Graph
  allPaths.forEach(path => {
    for (let i = 0; i < path.length - 1; i++) {
      const uId = getOrCreateNode(path[i]);
      const vId = getOrCreateNode(path[i+1]);
      const dist = getDist(path[i], path[i+1]);
      nodes.find(n => n.id === uId)!.neighbors.push({ nodeId: vId, dist });
      nodes.find(n => n.id === vId)!.neighbors.push({ nodeId: uId, dist });
    }
  });

  // Find start/end nodes
  let startNode = nodes[0], endNode = nodes[0];
  let minStartDist = Infinity, minEndDist = Infinity;

  nodes.forEach(n => {
    const dStart = getDist(n, userPos);
    const dEnd = getDist(n, destPos);
    if (dStart < minStartDist) { minStartDist = dStart; startNode = n; }
    if (dEnd < minEndDist) { minEndDist = dEnd; endNode = n; }
  });

  if (!startNode || !endNode) return [];

  // Dijkstra Algorithm
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const queue: string[] = nodes.map(n => n.id);

  nodes.forEach(n => { distances[n.id] = Infinity; previous[n.id] = null; });
  distances[startNode.id] = 0;

  while (queue.length > 0) {
    queue.sort((a, b) => distances[a] - distances[b]);
    const uId = queue.shift()!;
    if (uId === endNode.id || distances[uId] === Infinity) break;
    
    const uNode = nodes.find(n => n.id === uId)!;
    uNode.neighbors.forEach(neighbor => {
      const alt = distances[uId] + neighbor.dist;
      if (alt < distances[neighbor.nodeId]) {
        distances[neighbor.nodeId] = alt;
        previous[neighbor.nodeId] = uId;
      }
    });
  }

  // Reconstruct Path
  const path: Point[] = [];
  let curr: string | null = endNode.id;
  if (distances[curr] === Infinity) return []; 

  while (curr) {
    const n = nodes.find(node => node.id === curr)!;
    path.unshift({ lat: n.lat, lng: n.lng });
    curr = previous[curr];
  }

  return [userPos, ...path, destPos];
}