import folium, googlemaps, polyline, math, creds, json
from folium import plugins

# Load places from selected_places.json
with open('selected_places.json') as f:
    places = json.load(f)

# Initialize Google Maps Client with your API key
gmaps = googlemaps.Client(key=creds.api_key)

#Haversine Distance Between places
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in kilometers

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


# Dijkstra's algorithm
def dijkstra(start_place):
    # Initialize distances and previous nodes
    distances = {place["name"]: float("inf") for place in places}
    previous = {place["name"]: None for place in places}
    distances[start_place["name"]] = 0

    # Create a priority queue
    pq = [(0, start_place["name"])]

    while pq:
        current_dist, current_place_name = pq.pop(0)
        current_place = next(place for place in places if place["name"] == current_place_name)

        if current_dist > distances[current_place_name]:
            continue

        for neighbor in places:
            if neighbor["name"] == current_place_name:
                continue

            distance = haversine_distance(
                current_place["lat"], current_place["lon"], neighbor["lat"], neighbor["lon"]
            )

            new_distance = current_dist + distance
            if new_distance < distances[neighbor["name"]]:
                distances[neighbor["name"]] = new_distance
                previous[neighbor["name"]] = current_place
                pq.append((new_distance, neighbor["name"]))
    return distances, previous


def visualize_dijkstra(start_place, previous):
    start_coords = (start_place["lat"], start_place["lon"])
    map = folium.Map(location=start_coords, zoom_start=5)

    marker_group = folium.FeatureGroup(name="Markers")
    polyline_group = folium.FeatureGroup(name="Polylines")
    # Add the start marker
    start_marker = folium.Marker(start_coords, tooltip=start_place["name"], icon=folium.Icon(color="green"))
    marker_group.add_child(start_marker)

    # Add markers for the remaining places
    for place in places:
        if place["name"] != start_place["name"]:
            coords = (place["lat"], place["lon"])
            marker = folium.Marker(coords, tooltip=place["name"])
            marker_group.add_child(marker)

    map.add_child(marker_group)
    map.add_child(polyline_group)
    # Simulate the steps of Dijkstra's algorithm
    visited = set()
    current_place = start_place
    visited.add(current_place["name"])

    while True:
        # Find the nearest unvisited neighbor
        min_distance = float("inf")
        nearest_neighbor = None

        for neighbor in places:
            if neighbor["name"] not in visited:
                distance = haversine_distance(
                    current_place["lat"], current_place["lon"], neighbor["lat"], neighbor["lon"]
                )
                if distance < min_distance:
                    min_distance = distance
                    nearest_neighbor = neighbor

        # If all places have been visited, break out of the loop
        if nearest_neighbor is None:
            break
        # Draw the polyline from the current place to the nearest neighbor
        coords1 = (current_place["lat"], current_place["lon"])
        coords2 = (nearest_neighbor["lat"], nearest_neighbor["lon"])
        polyline = folium.PolyLine([coords1, coords2], color="red", weight=2.5, opacity=1)
        polyline_group.add_child(polyline)

        # Update the current place and visited set
        current_place = nearest_neighbor
        visited.add(current_place["name"])

    # display the map
    map.save("dijkstra_visualization.html")

# Example usage
start_place = places[0]
distances, previous = dijkstra(start_place)
visualize_dijkstra(start_place, previous)