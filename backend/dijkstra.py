from utils import load_data, get_road_distance

def dijkstra(start_place, end_place):
    data = load_data()
    distances = {place["name"]: float("inf") for place in data}
    previous = {place["name"]: None for place in data}
    distances[start_place["name"]] = 0
    unvisited = set(place["name"] for place in data)

    while unvisited:
        current_name = min(unvisited, key=lambda x: distances[x])
        current_place = next(place for place in data if place["name"] == current_name)
        unvisited.remove(current_name)

        if current_name == end_place["name"]:
            break

        for neighbor in data:
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
    data = load_data()
    route = []
    total_distance = 0

    for i in range(len(data) - 1):
        start_place = data[i]
        end_place = data[i + 1]
        segment = dijkstra(start_place, end_place)
        
        if segment:
            if route:  # Avoid duplicating places between segments
                route.extend(segment[1:])
            else:
                route.extend(segment)
            total_distance += sum(get_road_distance(segment[j], segment[j + 1]) for j in range(len(segment) - 1))

    return route, total_distance
