import gmplot

# Set up the map center and zoom level
gmap = gmplot.GoogleMapPlotter(-6.21462, 106.84513, 13)

# Add a marker to the map
gmap.marker(-6.21462, 106.84513)

# Generate the HTML code to display the map
html = gmap.get()

# Save the HTML file
with open('map.html', 'w') as f:
    f.write(html)
