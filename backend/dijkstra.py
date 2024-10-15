import folium
import googlemaps
import polyline
import math
import json
import os
import creds
from datetime import datetime
from datetime import datetime
from itertools import permutations

def load_data():
    folder_path = './data'
    file_path = os.path.join(folder_path, 'selected_places.json')
    with open(file_path) as f:
        places = json.load(f)
    return places

gmaps = googlemaps.Client(key=creds.api_key)

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

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371 

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def dijkstra(start_place, end_place):
    distances = {place["name"]: float("inf") for place in load_data()}
    previous = {place["name"]: None for place in load_data()}
    distances[start_place["name"]] = 0
    unvisited = set(place["name"] for place in load_data())

    while unvisited:
        current_name = min(unvisited, key=lambda x: distances[x])
        current_place = next(place for place in load_data() if place["name"] == current_name)
        unvisited.remove(current_name)

        if current_name == end_place["name"]:
            break

        for neighbor in load_data():
            if neighbor["name"] in unvisited:
                distance = get_road_distance(current_place, neighbor)
                new_distance = distances[current_name] + distance
                if new_distance < distances[neighbor["name"]]:
                    distances[neighbor["name"]] = new_distance
                    previous[neighbor["name"]] = current_place


    path = []
    current = end_place
    while current:
        path.append(current)
        current = previous[current["name"]]
    return list(reversed(path))

def find_shortest_route():
    unvisited = load_data()[1:]
    route = [load_data()[0]]
    total_distance = 0

    while unvisited:
        last = route[-1]
        nearest = min(unvisited, key=lambda x: get_road_distance(last, x))
        path = dijkstra(last, nearest)
        route.extend(path[1:])  # Exclude the first point to avoid duplication
        total_distance += sum(get_road_distance(path[i], path[i+1]) for i in range(len(path)-1))
        unvisited.remove(nearest)

    return route, total_distance

def visualize_route(route):
    start_coords = (route[0]["lat"], route[0]["lon"])
    map = folium.Map(location=start_coords, zoom_start=5)


    for i, place in enumerate(route):
        folium.Marker(
            [place['lat'], place['lon']],
            popup=f"{i+1}. {place['name']}",
            icon=folium.Icon(color='blue', icon='info-sign')
        ).add_to(map)


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


    for i in range(len(route) - 1):
        start = route[i]
        end = route[i+1]
        directions = gmaps.directions(
            f"{start['lat']},{start['lon']}",
            f"{end['lat']},{end['lon']}",
            mode="driving"
        )
        if directions:
            path = polyline.decode(directions[0]['overview_polyline']['points'])
            folium.PolyLine(path, weight=2, color='red', opacity=0.8).add_to(map)

    map.save("dijkstra_route.html")

# route, total_distance = find_shortest_route()
# visualize_route(route)

# print("Shortest route:")
# for i, place in enumerate(route):
#     print(f"{i+1}. {place['name']}")
# print(f"Total distance: {total_distance:.2f} km")
# print("Route visualization saved as 'dijkstra_route.html'")