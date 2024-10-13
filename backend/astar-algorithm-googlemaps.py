import folium
import googlemaps
import polyline
import math
import os
import creds
import json
import heapq
from datetime import datetime
from itertools import permutations

folder_path = './data'
file_path = os.path.join(folder_path, 'selected_places.json')
# Load places from selected_places.json
with open(file_path) as f:
    places = json.load(f)

gmaps = googlemaps.Client(key=creds.api_key)

def heuristic(place1, place2):
    return haversine_distance(place1['lat'], place1['lon'], place2['lat'], place2['lon'])

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def get_road_distance(place1, place2):
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
    total_path = [current]
    while current['name'] in came_from:
        current = came_from[current['name']]
        total_path.append(current)
    return list(reversed(total_path))

def nearest_neighbor_tsp(places):
    unvisited = places[1:]
    path = [places[0]]
    total_distance = 0

    while unvisited:
        last = path[-1]
        next_place = min(unvisited, key=lambda x: get_road_distance(last, x))
        path.append(next_place)
        unvisited.remove(next_place)
        total_distance += get_road_distance(last, next_place)

    return path, total_distance

def optimize_tsp(places):
    best_path = None
    best_distance = float('inf')

    for start in places:
        rotated_places = places[places.index(start):] + places[:places.index(start)]
        path, distance = nearest_neighbor_tsp(rotated_places)
        if distance < best_distance:
            best_distance = distance
            best_path = path

    return best_path, best_distance

def get_full_route(path):
    full_route = []
    for i in range(len(path) - 1):
        segment = astar(path[i], path[i+1])
        if segment:
            full_route.extend(segment[:-1]) 
    full_route.append(path[-1])  
    return full_route

def visualize_route(route):
    start_coords = (route[0]['lat'], route[0]['lon'])
    map = folium.Map(location=start_coords, zoom_start=5)

    # Add markers for all places
    for place in places:
        folium.Marker(
            [place['lat'], place['lon']],
            popup=place['name'],
            icon=folium.Icon(color='blue', icon='info-sign')
        ).add_to(map)

    # start and end points
    folium.Marker(
        [route[0]['lat'], route[0]['lon']],
        popup=f"Start: {route[0]['name']}",
        icon=folium.Icon(color='green', icon='play')
    ).add_to(map)
    folium.Marker(
        [route[-1]['lat'], route[-1]['lon']],
        popup=f"End: {route[-1]['name']}",
        icon=folium.Icon(color='red', icon='stop')
    ).add_to(map)

    # route
    for i in range(len(route) - 1):
        start = route[i]
        end = route[i+1]
        
        # Get directions between two points
        directions = gmaps.directions(
            f"{start['lat']},{start['lon']}",
            f"{end['lat']},{end['lon']}",
            mode="driving"
        )
        
        if directions:
            path = polyline.decode(directions[0]['overview_polyline']['points'])
            folium.PolyLine(path, weight=2, color='red', opacity=0.8).add_to(map)

    map.save("Astar-Path.html")

# Main execution
best_path, best_distance = optimize_tsp(places)
print(f"Best tour distance: {best_distance:.2f} km")
print("Best tour:")
for place in best_path:
    print(place['name'])

full_route = get_full_route(best_path)
visualize_route(full_route)
