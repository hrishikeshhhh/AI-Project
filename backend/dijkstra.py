from utils import load_data, get_road_distance


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
        route.extend(path[1:]) 
        total_distance += sum(get_road_distance(path[i], path[i+1]) for i in range(len(path)-1))
        unvisited.remove(nearest)

    return route, total_distance
