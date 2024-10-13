import folium, googlemaps, polyline, math, creds, json

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
    # Create map centered at the starting place
    map = folium.Map(location=[start_place['lat'], start_place['lon']], zoom_start=10)

    # Add markers for other places
    for place in places:
            folium.Marker(location=[place['lat'], place['lon']], popup=place['name']).add_to(map)

    # Draw polylines between all pairs of places based on Dijkstra's algorithm
    for place in places:
        if place != start_place:
            path = [place['name']]
            current_place = place
            while previous[current_place['name']]:
                path.append(previous[current_place['name']]['name'])
                current_place = previous[current_place['name']]
            path.reverse()
            for i in range(len(path) - 1):
                start = next(p for p in places if p['name'] == path[i])
                end = next(p for p in places if p['name'] == path[i + 1])
                directions = gmaps.directions(
                    f"{start['lat']}, {start['lon']}", f"{end['lat']}, {end['lon']}", mode="driving"
                )
                points = polyline.decode(directions[0]['overview_polyline']['points'])
                folium.PolyLine(locations=points, color='blue').add_to(map)

    # Save map to HTML file
    map.save("dijkstra_visualization.html")


    # Example usage
    start_place = places[0]
    distances, previous = dijkstra(start_place)
    visualize_dijkstra(start_place, previous)
