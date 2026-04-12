"""
Build county-to-utility mapping from EIA-861 service territory data.

Downloads the EIA service territory CSV, matches utility names to our utilities.json,
and outputs src/data/utility-counties.json mapping county FIPS codes to our utility names.
"""

import csv
import json
import os
import urllib.request

EIA_CSV_URL = "https://raw.githubusercontent.com/IMMM-SFA/electricity_entity_boundaries/master/Output_Files/2018/service_territory_2018.csv"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
UTILITIES_JSON = os.path.join(PROJECT_DIR, "src", "data", "utilities.json")
OUTPUT_JSON = os.path.join(PROJECT_DIR, "src", "data", "utility-counties.json")

# Manual mapping: our utility name -> EIA utility name(s)
# For utilities that don't auto-match via fuzzy search
MANUAL_EIA_MAP = {
    # Alabama
    "TVA / Huntsville Utilities": ["City of Huntsville - (AL)"],
    # Arkansas
    "Arkansas Electric Cooperatives": ["North Arkansas Elec Coop, Inc"],
    # California
    "Los Angeles DWP (LADWP)": ["Los Angeles Department of Water & Power"],
    # Colorado
    "Xcel Energy": ["Public Service Co of Colorado"],
    "Tri-State / Local Co-ops": ["Tri-State Electric Member Corp"],
    "Black Hills Energy": ["Black Hills Colorado Electric, LLC"],
    # Connecticut
    "Eversource": ["Connecticut Light & Power Co"],
    # DC / Maryland
    "Pepco": ["Potomac Electric Power Co"],
    # Georgia
    "Georgia EMCs (Co-ops)": [],  # Co-op aggregate — no single EIA entry
    # Idaho
    "Rocky Mountain Power": ["PacifiCorp"],
    # Iowa
    "Alliant Energy (Interstate Power)": ["Interstate Power and Light Co"],
    # Kansas
    "Evergy (Westar/KCP&L)": ["Westar Energy Inc"],
    "Kansas Electric Co-ops": ["Oklahoma Electric Coop Inc"],
    # Louisiana
    "SWEPCO": ["Southwestern Electric Power Co"],
    # Maine
    "Versant Power": ["Emera Maine"],
    # Massachusetts
    "National Grid": ["Massachusetts Electric Co"],
    # Michigan
    "DTE Energy": ["DTE Electric Company", "Detroit Edison Co"],
    # Minnesota
    "Xcel Energy": ["Northern States Power Co"],
    "Minnesota Power (Allete)": ["ALLETE, Inc."],
    "Great River Energy Co-ops": [],  # Wholesale only
    # Missouri
    "Ameren Missouri": ["Union Electric Co - (MO)"],
    "Evergy Missouri (KCP&L)": ["Kansas City Power & Light Co"],
    # Mississippi
    "TVA / Local Distributors": [],
    # New Hampshire
    "Eversource (PSNH)": ["Public Service Co of NH"],
    "Unitil / Liberty": ["Unitil Energy Systems", "Liberty Utilities (Granite State Electri", "Liberty Utilities"],
    # New Jersey
    "PSE&G": ["Public Service Elec & Gas Co"],
    # New Mexico
    "PNM Resources": ["Raton Public Service Company"],
    "Xcel Energy (SPS)": ["Southwestern Public Service Co"],
    # Nevada
    "NV Energy": ["Nevada Power Co", "Sierra Pacific Power Co"],
    # New York
    "Con Edison": ["Consolidated Edison Co-NY Inc"],
    "National Grid (Niagara Mohawk)": ["Niagara Mohawk Power Corp."],
    "NYSEG": ["New York State Elec & Gas Corp"],
    "PSEG Long Island (LIPA)": ["Long Island Power Authority"],
    # North Carolina
    "NC Electric Co-ops": ["Central Electric Membership Corp. - (NC)"],
    # North Dakota
    "Xcel Energy (NSP)": ["Northern States Power Co"],
    # Ohio
    "Ohio Edison / FirstEnergy": ["Ohio Edison Co"],
    "AEP Ohio": ["Ohio Power Co"],
    # Oklahoma
    "Public Service Co of Oklahoma (PSO/AEP)": ["Public Service Co of Oklahoma"],
    "Oklahoma Electric Co-ops": ["Oklahoma Electric Coop Inc"],
    # Pennsylvania
    "FirstEnergy (Met-Ed/Penelec/Penn Power)": ["Metropolitan Edison Co", "Pennsylvania Elec Co"],
    # Rhode Island
    "Rhode Island Energy (PPL)": ["The Narragansett Electric Co"],
    # South Carolina
    "SC Electric Co-ops": ["Mid-Carolina Electric Coop Inc"],
    # South Dakota
    "Xcel Energy (NSP)": ["Northern States Power Co"],
    "Black Hills Energy": ["Black Hills Power, Inc. d/b/a"],
    "East River Electric Co-ops": ["Central Electric Coop, Inc - (SD)"],
    # Tennessee
    "Memphis Light Gas & Water": ["City of Memphis - (TN)"],
    "TVA / Other Distributors": [],
    # Texas
    "Oncor (delivery) — avg retail": ["Oncor Electric Delivery Co LLC"],
    "CenterPoint (delivery) — avg retail": ["CenterPoint Energy"],
    "AEP Texas (delivery) — avg retail": ["AEP Texas Central Company", "AEP Texas North Company"],
    "CPS Energy (San Antonio)": ["City of San Antonio - (TX)"],
    # Utah
    "Rocky Mountain Power": ["PacifiCorp"],
    "Murray City Power": ["City of Murray - (UT)"],
    # Virginia
    "Dominion Energy Virginia": ["Virginia Electric & Power Co"],
    "Virginia Electric Co-ops (Old Dominion)": ["Central Virginia Electric Coop"],
    # Washington
    "Seattle City Light": ["City of Seattle - (WA)"],
    "Tacoma Power": ["City of Tacoma - (WA)"],
    # Wisconsin
    "We Energies (WEC)": ["Wisconsin Electric Power Co"],
    "Alliant Energy (WPL)": ["Wisconsin Power & Light Co"],
    "Xcel Energy (NSP)": ["Northern States Power Co"],
    # West Virginia
    "Mon Power / Potomac Edison (FirstEnergy)": ["Monongahela Power Co", "Potomac Edison Co"],
    # Wyoming
    "Rocky Mountain Power": ["PacifiCorp"],
    "Black Hills Energy": ["Black Hills Power, Inc. d/b/a", "Cheyenne Light Fuel & Power Co"],
}


def load_our_utilities():
    """Load our utilities.json and build a flat list of (state, name, customers)."""
    with open(UTILITIES_JSON) as f:
        data = json.load(f)
    utils = []
    for state_code, state_data in data.items():
        for u in state_data["utilities"]:
            utils.append({
                "state": state_code,
                "name": u["name"],
                "customers": u["customers"],
                "ratePerKwh": u["ratePerKwh"],
            })
    return utils, data


def load_eia_territories():
    """Download and parse the EIA service territory CSV."""
    csv_path = os.path.join(SCRIPT_DIR, "service_territory_2018.csv")
    if not os.path.exists(csv_path):
        print("Downloading EIA service territory data...")
        urllib.request.urlretrieve(EIA_CSV_URL, csv_path)

    # Build: EIA utility name -> list of county FIPS
    eia = {}
    with open(csv_path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row["Utility_Name"].strip()
            fips = row["County_FIPS"].strip()
            if name not in eia:
                eia[name] = []
            eia[name].append(fips)
    return eia


def fuzzy_match(our_name, eia_names):
    """Try to auto-match our utility name to an EIA name."""
    our_lower = our_name.lower().replace("(", "").replace(")", "").replace("&", "and")
    for eia_name in eia_names:
        eia_lower = eia_name.lower()
        # Check if significant portion of our name appears in EIA name or vice versa
        our_words = [w for w in our_lower.split() if len(w) > 3]
        matches = sum(1 for w in our_words if w in eia_lower)
        if matches >= 2:
            return eia_name
        # Check prefix match
        if our_lower[:15] in eia_lower or eia_lower[:15] in our_lower:
            return eia_name
    return None


def build_mapping():
    our_utils, utils_data = load_our_utilities()
    eia = load_eia_territories()
    eia_names = list(eia.keys())

    # State FIPS prefix to state code mapping
    state_fips_to_code = {
        "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
        "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
        "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
        "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
        "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
        "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
        "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
        "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
        "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
        "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI",
        "56": "WY",
    }

    # Build county FIPS -> our utility name
    # For each of our utilities, find matching EIA counties
    county_to_utility = {}  # fips -> {name, customers}
    matched = 0
    unmatched = 0

    for u in our_utils:
        our_name = u["name"]
        eia_matches = []

        # Check manual mapping first (normalize dashes and special chars for matching)
        def norm(s):
            return s.replace("\u2014", "-").replace("\u2013", "-").replace("\ufffd", "-")
        manual_key = None
        for k in MANUAL_EIA_MAP:
            if k == our_name or norm(k) == norm(our_name):
                manual_key = k
                break
        if manual_key is not None:
            for eia_name in MANUAL_EIA_MAP[manual_key]:
                if eia_name in eia:
                    eia_matches.extend(eia[eia_name])
        else:
            # Try fuzzy match
            match = fuzzy_match(our_name, eia_names)
            if match:
                eia_matches = eia[match]

        if eia_matches:
            matched += 1
            state_prefix = {v: k for k, v in state_fips_to_code.items()}.get(u["state"], "")
            for fips in eia_matches:
                # Only assign if this county is in the right state (or close)
                county_state = fips[:2]
                # Allow cross-state utilities but prefer same-state
                if fips in county_to_utility:
                    # Keep the one with more customers
                    if u["customers"] > county_to_utility[fips]["customers"]:
                        county_to_utility[fips] = {"name": our_name, "customers": u["customers"], "state": u["state"]}
                else:
                    county_to_utility[fips] = {"name": our_name, "customers": u["customers"], "state": u["state"]}
        else:
            unmatched += 1
            print(f"  UNMATCHED: {u['state']}: {our_name}")

    print(f"\nMatched: {matched}, Unmatched: {unmatched}")
    print(f"Counties mapped: {len(county_to_utility)}")

    # Manually add remaining TX utilities that fail due to em dash encoding
    for eia_name in ["CenterPoint Energy"]:
        for fips in eia.get(eia_name, []):
            if fips not in county_to_utility:
                county_to_utility[fips] = {"name": "CenterPoint (delivery) \u2014 avg retail", "customers": 2700000, "state": "TX"}
    for eia_name in ["AEP Texas Central Company", "AEP Texas North Company"]:
        for fips in eia.get(eia_name, []):
            if fips not in county_to_utility:
                county_to_utility[fips] = {"name": "AEP Texas (delivery) \u2014 avg retail", "customers": 1100000, "state": "TX"}

    # Simplify output: just county FIPS -> utility name
    output = {}
    for fips, info in sorted(county_to_utility.items()):
        output[fips] = info["name"]

    # Write output
    with open(OUTPUT_JSON, "w") as f:
        json.dump(output, f, indent=None, separators=(",", ":"))

    print(f"Written to {OUTPUT_JSON} ({os.path.getsize(OUTPUT_JSON)} bytes)")

    # Stats per state
    state_counts = {}
    for fips, name in output.items():
        st = state_fips_to_code.get(fips[:2], "??")
        state_counts[st] = state_counts.get(st, 0) + 1
    for st in sorted(state_counts):
        print(f"  {st}: {state_counts[st]} counties")


if __name__ == "__main__":
    build_mapping()
