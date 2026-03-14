# VTT Slicer — Project Specification (v1)

## 1. Purpose

VTT Slicer is a browser-based tool for preparing tabletop RPG map images for home printing.

The application allows a user to:

- Upload a map image
- Specify the final printed map size in inches
- Slice the map into printer-friendly tiles
- Export the tiles as a multi-page PDF on US Letter paper
- Optionally apply grid overlays and basic image adjustments

The system is intended for battle maps and similar tabletop play surfaces.

---

## 2. Platform & Architecture

### Platform
- Static web application
- Hosted on Cloudflare
- No required backend for v1

### Recommended stack
- Vite
- React
- TypeScript
- Canvas-based rendering
- Client-side PDF generation

### Processing model
All processing occurs in the browser:
- image loading
- transforms
- preview rendering
- slicing
- PDF generation

### Rendering strategy
The app does **not** build one giant final canvas for the entire printed map.

Instead:
1. The uploaded image is treated as the source map
2. Slice calculations are performed mathematically
3. Each page tile is rendered independently
4. Each tile is placed directly into the output PDF

This avoids large memory usage for big maps.

---

## 3. Output Page Format

All exported pages are:

- US Letter
- 8.5 × 11 inches
- Portrait orientation

This is always true in v1.

---

## 4. Tile Slice Sizes

The user can choose one of two tile content sizes:

- 8 × 10 inches
- 8 × 10.5 inches

These are the maximum printable content dimensions for each page tile.

Edge tiles may be smaller.

---

## 5. Page Margins

Margins depend on selected tile size.

### For 8 × 10 tiles
- left margin = 0.25"
- right margin = 0.25"
- top margin = 0.5"
- bottom margin = 0.5"

### For 8 × 10.5 tiles
- left margin = 0.25"
- right margin = 0.25"
- top margin = 0.25"
- bottom margin = 0.25"

These margins define the content box where the tile image is placed.

---

## 6. Slice Orientation

The user can choose:

- Portrait slicing
- Landscape slicing

### Core implementation rule
All output PDF pages remain portrait US Letter.

The export engine uses a single canonical portrait-tile slicing model.

Landscape slicing is implemented by rotating the **map coordinate system** 90 degrees before slice calculation and rendering, rather than by changing PDF page orientation.

This keeps the PDF layout logic uniform.

---

## 7. Printed Map Size Input

The user specifies the final assembled printed map size in inches:

- Printed map width
- Printed map height

Example:
- 24" wide × 18" tall

These values define the physical size of the assembled map after printing and assembly.

---

## 8. Map Alignment on the Overall Page Array

The full printed map is aligned to the overall page array as follows:

- The upper-left corner of the map aligns to the upper-left corner of the printed array of pages

This means the map is **not centered** on the page array in v1.

Any leftover partial space appears only on:

- the rightmost column
- the bottom row

### Example
For a 20" × 28" map using 8" × 10" slices:

- width becomes 8 + 8 + 4
- height becomes 10 + 10 + 8

Not:
- 6 + 8 + 6
- 9 + 10 + 9

Centered array alignment may be added in a future version.

---

## 9. Tile Grid Calculation

Let:

- `mapWidthIn` = final printed map width
- `mapHeightIn` = final printed map height
- `tileWidthIn` = selected tile width
- `tileHeightIn` = selected tile height

Then:

- `cols = ceil(mapWidthIn / tileWidthIn)`
- `rows = ceil(mapHeightIn / tileHeightIn)`

Interior tiles are full size.

Partial tiles may appear only on:
- the last column
- the last row

under the v1 upper-left array alignment rule.

---

## 10. Tile Size Calculation

Each tile starts with the maximum tile size.

### Width
For all non-final columns:
- tile width = full tile width

For the last column:
- tile width = remaining map width

### Height
For all non-final rows:
- tile height = full tile height

For the last row:
- tile height = remaining map height

### Example
If map width is 20" and tile width is 8":
- column widths = 8, 8, 4

If map height is 28" and tile height is 10":
- row heights = 10, 10, 8

---

## 11. Tile Placement Within a Page

Tiles are placed inside the page content box using edge-aware justification rules so partial edge tiles visually align with adjacent pages.

### Vertical justification

#### Top row
If a tile is partial in height and belongs to the first/top row, it is justified to the **bottom** of the page content box.

Reason:
- it should visually touch the row below it

#### Middle rows
Middle rows are expected to be full height.
Justification is irrelevant.

#### Bottom row
If a tile is partial in height and belongs to the last/bottom row, it is justified to the **top** of the page content box.

Reason:
- it should visually touch the row above it

---

### Horizontal justification

#### Left column
If a tile is partial in width and belongs to the first/left column, it is justified to the **right** of the page content box.

Reason:
- it should visually touch the column to its right

#### Middle columns
Middle columns are expected to be full width.
Justification is irrelevant.

#### Right column
If a tile is partial in width and belongs to the last/right column, it is justified to the **left** of the page content box.

Reason:
- it should visually touch the column to its left

---

### Combined justification
Horizontal and vertical justification rules combine.

Example:
- a bottom-right corner partial tile is justified top + left

Note:
Under v1 upper-left array alignment, actual partial tiles occur only in the last column, last row, and bottom-right corner. However, the full rule is defined now for future compatibility.

---

## 12. Page Labels / Tile Numbering

Page labeling is included in v1.

Tiles are labeled by row and column:

- A1, A2, A3
- B1, B2, B3
- C1, C2, C3

Where:
- rows use letters
- columns use numbers

Labels are placed in the page margin area, not inside the map artwork.

Possible future enhancement:
- include both tile label and page count, such as `A2 (page 2 of 6)`

---

## 13. Image Fit Modes

The user can choose how the uploaded image fits the requested printed map size.

### Modes

#### Stretch
- image is stretched independently in X and Y
- fills the map area exactly
- may distort aspect ratio

#### Contain
- preserves aspect ratio
- image fits fully inside the requested map size
- may leave blank margins

#### Cover
- preserves aspect ratio
- image fills the requested map size completely
- may crop some content

---

## 14. Export Resolution

The app includes a DPI selector in v1.

Options:
- 150 DPI (default)
- 200 DPI
- 300 DPI

Higher DPI increases quality and file size.

---

## 15. Image Adjustments

The app includes basic image adjustments in v1.

### Controls
- Brightness
- Contrast
- Saturation

### Saturation behavior
- 0 = grayscale / fully desaturated
- 1 = original color
- greater than 1 may be allowed for enhanced color

---

## 16. Grid Overlay

The app supports optional grid overlay.

### v1 grid type
- Square grid only

### Planned future grid type
- Hex grid

### Grid options
- enable / disable grid
- grid size in final printed inches
- line thickness
- line opacity
- line color

### Grid display modes
Preview and export grid behavior should be controllable independently.

Possible v1 behavior:
- preview grid on/off
- export grid on/off

---

## 17. Preview UI

The preview pane should display:

- the uploaded image
- page slice boundaries
- tile labels
- optional grid overlay

The preview should allow the user to verify:
- page count
- tile arrangement
- edge pieces
- how the map is being sliced

The preview should use the same coordinate logic as the export engine.

---

## 18. Export Workflow

When the user clicks the export button:

For each tile:
1. Determine the tile’s physical position in the assembled map
2. Determine the corresponding region of the map image
3. Apply the selected fit mode
4. Apply the map orientation transform if landscape slicing is selected
5. Render the tile at the selected DPI
6. Apply image adjustments
7. Apply grid overlay if export grid is enabled
8. Place the tile in the page content box according to justification rules
9. Add the page label
10. Append the page to the PDF

Then:
- the final PDF is generated client-side
- the PDF is downloaded locally

---

## 19. UI Controls Planned for v1

### File input
- upload image

### Map size
- printed map width (inches)
- printed map height (inches)

### Slice controls
- tile size: 8 × 10 or 8 × 10.5
- slice orientation: portrait or landscape

### Fit controls
- stretch
- contain
- cover

### Resolution
- DPI slider or selector: 150 / 200 / 300

### Image adjustments
- brightness
- contrast
- saturation

### Grid controls
- grid enable/disable
- preview grid enable/disable
- export grid enable/disable
- grid size
- line thickness
- line opacity
- line color

### Labels
- page labels on/off

### Action
- export PDF

---

## 20. v1.1 / Future Enhancements

Possible future features include:

- centered page-array alignment
- overlap / bleed between pages
- crop marks / trim marks
- hex grid support
- map rotation controls in UI
- saved projects
- project presets
- automatic color normalization / ink-saving analysis
- sharpening / printer optimization
- support for multiple uploaded images
- page footer customization

---

## 21. Core Rule Summary

The core architectural rule of this project is:

All output PDF pages are portrait US Letter.

The export engine uses a single canonical portrait-tile slicing model.

Landscape slicing is implemented by rotating the map coordinate system 90 degrees before slice calculation and rendering, rather than by changing PDF page orientation.

This rule keeps export logic uniform and simplifies implementation.
