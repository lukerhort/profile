# XFLR5 Analysis Guide — FX 63-137 Airfoil
**AE 403W Wing in Ground Effect Vehicle**
**Wing Specs: AR=5.4, Span=5.4 ft, Chord=12 in, 4-motor distributed propulsion**

---

## What XFLR5 Does (and Why You're Using It)

XFLR5 is a free aerodynamics tool that runs **XFoil** (2D airfoil analysis) and **Vortex Lattice / Lifting Line Theory** (3D wing analysis). For your project it will:

1. Generate **Cl vs α**, **Cd vs α**, and **Cl/Cd vs α** polars for the FX 63-137 at your operating Reynolds numbers
2. Model your 3D wing including the downward anhedral winglets
3. Run a **ground effect analysis** (image plane method) to show the difference in lift and drag when flying within one chord/wingspan of the surface
4. Give you the data tables for your final report and CFD comparison

**Your operating Reynolds number:**
- Chord = 12 in = 0.3048 m
- Expected cruise speed = 10–20 mph (4.5–9 m/s) — a WIG at RC scale is slow
- Re = V × c / ν ≈ 9 m/s × 0.3048 / 1.5×10⁻⁵ ≈ **183,000**
- Analyze across Re = 100,000 to 300,000 to cover your full speed range

---

## Part 1: Download and Install XFLR5

**Step 1:** Go to [sourceforge.net/projects/xflr5](https://sourceforge.net/projects/xflr5/) and click **"Download"**.

**Step 2:** Run the installer. Accept defaults. It installs to `C:\Program Files\XFLR5` on Windows or `/Applications/xflr5` on Mac.

**Step 3:** Launch XFLR5. You'll see a gray workspace with a menu bar. Normal — nothing is loaded yet.

---

## Part 2: Get the FX 63-137 Airfoil Coordinates

**Step 1:** Go to the UIUC Airfoil Database:
`https://m-selig.ae.illinois.edu/ads/coord/fx63137.dat`

**Step 2:** Open that page in a browser. You'll see columns of numbers — these are the X/Y coordinates of the airfoil surface. Save the file as `fx63137.dat` anywhere on your computer (right-click → Save As, or just copy-paste into a text file with that name).

The file format looks like:
```
FX 63-137
1.0000   0.0013
0.9500   0.0147
...
0.0000   0.0000
...
1.0000  -0.0013
```

---

## Part 3: Import the Airfoil into XFLR5

**Step 1:** In XFLR5, go to the menu: **File → Direct Foil Design** (or just look for the foil design mode in the top-left dropdown — it may say "XFoil Direct Analysis").

Actually, the correct path is: click the **mode selector** in the top-left corner. It will show a dropdown with:
- Direct Foil Design
- XFoil Direct Analysis  ← go here first
- XFoil Inverse Analysis
- Mach-Re polar graphs
- Wing and Plane Design

Select **"XFoil Direct Analysis"**.

**Step 2:** Go to **Foil → Import Foil from File...** (or **File → Import Foil**).

**Step 3:** Navigate to your `fx63137.dat` file and open it.

**Step 4:** The FX 63-137 airfoil will appear in the workspace as a shape with a thick nose, flat bottom, and strongly cambered upper surface. It should look like a very curved teardrop. If it looks right (thick camber, flat-ish bottom), you're good.

**Step 5:** Check that the airfoil name shows as "FX 63-137" in the left panel foil list.

---

## Part 4: Run XFoil 2D Analysis (Polars)

This generates the core performance data: lift, drag, and moment vs. angle of attack.

**Step 1:** In XFoil Direct Analysis mode, make sure the FX 63-137 is selected in the foil list on the left.

**Step 2:** Go to **Polar → Define Analysis...** (or **Analysis → Define Analysis**).

A dialog box appears. Set:
- **Analysis type:** Type 1 (fixed speed — best for airfoil polars at a given Reynolds number)
- **Reynolds number:** `150000` (type just the number, no commas)
- **Mach number:** `0.00` (you're subsonic RC, ignore Mach)
- **NCrit (turbulence):** `9` (default — this is free-stream turbulence level; 9 is standard for clean conditions)

Click **OK**. This creates a "polar" — a set of conditions to analyze.

**Step 3:** Repeat Step 2 to create **three more polars** at:
- Re = `100000`
- Re = `200000`
- Re = `300000`

You want multiple Reynolds numbers because your vehicle will operate across this range depending on speed.

**Step 4:** Select the Re=150,000 polar from the left panel.

**Step 5:** Go to **Analysis → Batch Analysis...**

Set:
- **Start angle (α):** `-5`
- **End angle (α):** `20`
- **Step (Δα):** `0.5`

Click **Analyze**. XFLR5 will run XFoil and sweep through angles of attack from -5° to 20° in 0.5° steps.

**Step 6:** Repeat Step 5 for each of your other Reynolds number polars (100k, 200k, 300k).

**Step 7:** Go to **Graphs** (or the graph icons in the toolbar) to see your polars. Common plots to look at:
- **Cl vs α** — lift curve (should show the FX 63-137's steep slope and high Cl max ~1.7–1.9)
- **Cd vs α** — drag vs angle
- **Cl/Cd vs α** — efficiency — your best cruise angle of attack is at the peak of this curve
- **Cl vs Cd** (drag polar) — classic "banana" shaped curve

**What you expect to see for FX 63-137 at Re=150,000:**
- Cl max ≈ 1.6–1.8 (excellent for a low-speed airfoil)
- Zero-lift angle of attack ≈ −7° to −8° (strongly positive camber)
- Best L/D angle ≈ 4°–8° depending on Re
- L/D max ≈ 40–60 at these Reynolds numbers

**Step 8:** Export your polar data: **Polar → Export Current Polar** → save as `.txt` or `.csv`. This is your table data for the final report.

---

## Part 5: Set Up Your 3D Wing in Wing Design Mode

**Step 1:** In the mode dropdown (top-left), select **"Wing and Plane Design"**.

**Step 2:** Go to **Wing → Define Wing...** (or click the wing icon).

A wing editor dialog opens. You'll define your wing by entering section properties.

**Step 3:** Set up the inner flat wing section. The wing editor shows a table with columns for:
- **y (span position)**
- **Chord**
- **Offset** (sweep — 0 for your straight wing)
- **Twist** (0 for now)
- **Foil name**
- **Dihedral**

Enter these sections (XFLR5 works in meters or the units you set — check **Units → Set Units** first and choose **m, m/s, kg** or **in, ft/s, lb** — meters is recommended):

| Section | y (m) | Chord (m) | Sweep | Twist | Foil | Dihedral |
|---------|--------|-----------|-------|-------|------|----------|
| Root (centerline) | 0.000 | 0.305 | 0.0 | 0.0 | FX 63-137 | 0° |
| Inner/Outer break | 0.542 | 0.305 | 0.0 | 0.0 | FX 63-137 | 0° |
| Tip with anhedral | 0.762 | 0.305 | 0.0 | 0.0 | FX 63-137 | −15° |

> **Notes on geometry:**
> - Half-span = 5.4 ft / 2 = 2.7 ft = 0.823 m. The inner flat section is 42.8 in = 1.087 m total (543.5 mm each side).
> - The outer drooped panels are at −15° dihedral (downward anhedral).
> - Your winglets are inverted (3.03 in = 0.077 m tip devices pointing down).
> - For the winglets, add a final section at y ≈ 0.839 m with a very short chord and dihedral = −90° (straight down) or treat them as a boundary condition.

**Step 4:** Make sure the **Foil** column says "FX 63-137" for all sections. XFLR5 needs the airfoil to be loaded (from Part 3) to assign it to wing sections.

**Step 5:** Click **OK** to save the wing. Name it something like "WIG Wing."

**Step 6:** The wing will appear in the 3D workspace. You can rotate the view with the mouse.

---

## Part 6: Run 3D Wing Analysis (Out of Ground Effect First)

**Step 1:** Make sure your wing is selected in the wing list.

**Step 2:** Go to **Analysis → Define Analysis...** for the wing.

Set:
- **Analysis method:** **VLM2** (Vortex Lattice Method — faster and good enough for your geometry) or **Panel** method (more accurate for ground effect)
- **Viscous:** ✓ Check this box — it uses your XFoil polar data to correct for viscous drag
- **Ground effect:** Leave UNCHECKED for this first run (out-of-ground-effect baseline)
- **Speed:** Set your cruise speed, e.g., **9 m/s** (about 20 mph)
- **Density:** 1.225 kg/m³ (sea level standard)

**Step 3:** Run a sweep: **Analysis → Batch Analysis**
- α from −5° to 15°, step 0.5°

**Step 4:** View results — you should see CL, CD, CM vs α for the full 3D wing. Note the **induced drag** component — this is what ground effect will reduce.

---

## Part 7: Run Ground Effect Analysis

This is the key step — comparing performance in-ground-effect (IGE) vs out-of-ground-effect (OGE).

**Step 1:** In the wing analysis settings (**Analysis → Define Analysis**):
- Check **"Ground Effect"**
- Set **Height above ground (h):** This is the distance from the wing's reference point to the ground

For your vehicle, set multiple heights:
- h = 0.076 m (3 inches = 0.25c — deep ground effect, within 0.1 chord... actually 0.25 chord)
- h = 0.152 m (6 inches = 0.5c — strong ground effect)
- h = 0.305 m (12 inches = 1c — at one chord length, moderate GE)
- h = 0.610 m (24 inches = 2c — light ground effect)
- h = 3.000 m (10 feet = far away — essentially out of ground effect)

**Step 2:** Run a batch analysis for each height value. Give each analysis a descriptive name like "IGE_h=0.5c" so you can compare them in the graph.

**Step 3:** In the results, compare:
- **Induced drag (CDi)** at each height — you should see CDi drop significantly as you approach the ground
- **CL at the same α** — slight increase in lift in ground effect
- **Oswald efficiency factor (e)** — increases as you get lower

**What to expect (FX 63-137 at AR=5.4 near ground):**

| Ride Height (h/c) | Approx. CDi reduction |
|---|---|
| Out of GE (h > 3c) | Baseline |
| h = 1.0c | ~10–15% CDi reduction |
| h = 0.5c | ~25–30% CDi reduction |
| h = 0.25c | ~40–50% CDi reduction |
| h = 0.1c | ~60%+ CDi reduction |

Your winglets (downward-facing tip devices) further enhance this by trapping the high-pressure air under the wing — XFLR5 won't fully model this, but the VLM analysis will still show the baseline benefit.

---

## Part 8: Export and Plot Results for Your Report

**Step 1:** Right-click on any graph → **Export Graph** to save as PNG or SVG for your report.

**Step 2:** **Polar → Export Current Polar** to get `.txt` data tables.

**Step 3:** Key figures to include in your report:
1. Cl vs α plot (2D, all Reynolds numbers on one graph)
2. Cl/Cd vs α (2D) — identifying your best cruise α
3. 3D wing Cl vs α — OGE vs multiple IGE heights on one plot
4. CDi vs ride height (h/c) — the key result showing ground effect benefit
5. Oswald efficiency (e) vs ride height

**Step 4:** For your flight test comparison, log the actual Cl and drag using:
- Measured speed → Re → interpolate from your XFLR5 polars
- Power draw from the flight controller → estimate thrust → compare to predicted drag

---

## Part 9: Troubleshooting Common XFLR5 Issues

**"Foil not found" error when setting up wing:**
- Go back to XFoil Direct Analysis mode, make sure the FX 63-137 is loaded, then return to Wing Design.

**Analysis fails or returns NaN values:**
- Check that your viscous polars have data at the α range you're trying to analyze. If the polar only goes to α=15° and you sweep to 18°, it will fail. Extend your XFoil polar range.

**Wing looks wrong in 3D view:**
- Double-check your section y-positions. XFLR5 uses half-span (each side separately) — don't enter the full span.

**Polar curves look jagged or unrealistic:**
- Reduce your α step size to 0.25° for smoother curves. Also check NCrit — try 7 instead of 9 if results look odd.

**Ground effect results don't show much difference:**
- Make sure VLM2 or Panel method is selected (not LLT — Lifting Line Theory doesn't support ground effect planes).

---

## Summary of Key Numbers You Should Get Out of XFLR5

By the end of your analysis, you should have:

| Parameter | Value to find |
|---|---|
| Cl max (2D, FX 63-137) | ~1.7–1.9 at Re=150k |
| Best L/D angle of attack | ~5°–8° |
| L/D max (2D) | ~50–70 at Re=200k |
| 3D wing Cl max (AR=5.4) | ~1.3–1.5 (aspect ratio penalty) |
| Cruise Cl (3D OGE, α=4°) | ~0.8–1.0 |
| CDi reduction at h=0.5c | ~25–30% |
| CDi reduction at h=0.25c | ~40–50% |
| Required takeoff speed (estimate) | 10–18 mph |

These numbers give you the theoretical baseline to compare against your flight test data (speed, power draw, ride height logged by the Pixhawk).
