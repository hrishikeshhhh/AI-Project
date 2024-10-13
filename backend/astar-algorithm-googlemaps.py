import folium
import googlemaps
import polyline
import math
import backend.creds as creds
import json
import heapq
from datetime import datetime

# Load places from selected_places.json
with open('selected_places.json') as f:
    places = json.load(f)

# Initialize Google Maps Client with your API key
gmaps = googlemaps.Client(key=creds.api_key)

def heuristic(place1, place2):
    """Calculate the straight-line distance between two places."""
    return haversine_distance(place1['lat'], place1['lon'], place2['lat'], place2['lon'])

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on the Earth."""
    R = 6371  # Earth's radius in kilometers

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def get_road_distance(place1, place2):
    """Get the road distance between two places using Google Maps Directions API."""
    result = gmaps.directions(
        f"{place1['lat']},{place1['lon']}",
        f"{place2['lat']},{place2['lon']}",
        mode="driving",
        departure_time=datetime.now()
    )
    
    if result:
        return result[0]['legs'][0]['distance']['value'] / 1000  # Convert meters to kilometers
    else:
        return haversine_distance(place1['lat'], place1['lon'], place2['lat'], place2['lon'])

def astar(start_place, goal_place):
    """A* algorithm implementation."""
    open_set = []
    heapq.heappush(open_set, (0, start_place['name']))
    came_from = {}
    g_score = {place['name']: float('inf') for place in places}
    g_score[start_place['name']] = 0
    f_score = {place['name']: float('inf') for place in places}
    f_score[start_place['name']] = heuristic(start_place, goal_place)

    while open_set:
        current_name = heapq.heappop(open_set)[1]
        current = next(place for place in places if place['name'] == current_name)

        if current['name'] == goal_place['name']:
            return reconstruct_path(came_from, current)

        for neighbor in places:
            if neighbor['name'] == current['name']:
                continue

            tentative_g_score = g_score[current['name']] + get_road_distance(current, neighbor)

            if tentative_g_score < g_score[neighbor['name']]:
                came_from[neighbor['name']] = current
                g_score[neighbor['name']] = tentative_g_score
                f_score[neighbor['name']] = g_score[neighbor['name']] + heuristic(neighbor, goal_place)
                if neighbor['name'] not in [item[1] for item in open_set]:
                    heapq.heappush(open_set, (f_score[neighbor['name']], neighbor['name']))

    return None

def reconstruct_path(came_from, current):
    """Reconstruct the path from start to goal."""
    total_path = [current]
    while current['name'] in came_from:
        current = came_from[current['name']]
        total_path.append(current)
    return list(reversed(total_path))

def visualize_astar(path):
    """Visualize the A* path on a map."""
    start_coords = (path[0]['lat'], path[0]['lon'])
    map = folium.Map(location=start_coords, zoom_start=5)

    # Add markers for all places
    for place in places:
        folium.Marker(
            [place['lat'], place['lon']],
            popup=place['name'],
            icon=folium.Icon(color='blue', icon='info-sign')
        ).add_to(map)

    # Highlight start and end points
    folium.Marker(
        [path[0]['lat'], path[0]['lon']],
        popup=f"Start: {path[0]['name']}",
        icon=folium.Icon(color='green', icon='play')
    ).add_to(map)
    folium.Marker(
        [path[-1]['lat'], path[-1]['lon']],
        popup=f"End: {path[-1]['name']}",
        icon=folium.Icon(color='red', icon='stop')
    ).add_to(map)

    # Draw the path
    for i in range(len(path) - 1):
        start = path[i]
        end = path[i+1]
        
        # Get directions between two points
        directions = gmaps.directions(
            f"{start['lat']},{start['lon']}",
            f"{end['lat']},{end['lon']}",
            mode="driving"
        )
        
        if directions:
            # Decode the polyline
            route = polyline.decode(directions[0]['overview_polyline']['points'])
            folium.PolyLine(route, weight=2, color='red', opacity=0.8).add_to(map)

    map.save("astar_visualization.html")

# Example usage
start_place = places[0]
goal_place = places[-1]
path = astar(start_place, goal_place)

if path:
    print("Optimal path:")
    for place in path:
        print(place['name'])
    visualize_astar(path)
else:
    print("No path found.")
