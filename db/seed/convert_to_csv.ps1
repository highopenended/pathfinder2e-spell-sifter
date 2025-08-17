# Convert JSON files to CSV for Supabase import and clean duplicates
# Run this script in PowerShell from your project directory

Write-Host "Converting traitsData.JSON to CSV..." -ForegroundColor Green

# Convert traits to CSV
$traitsJson = Get-Content "db/seed/traitsData.JSON" | ConvertFrom-Json
$traitsJson | Select-Object @{Name='name';Expression={$_.Trait}}, @{Name='description';Expression={$_.Description}} | 
    Export-Csv "db/seed/traits.csv" -NoTypeInformation -Encoding UTF8 -Force

Write-Host "Converting spellsData.JSON to CSV..." -ForegroundColor Green

# Convert spells to CSV - map to actual database column names and convert rank to integer
$spellsJson = Get-Content "db/seed/spellsData.JSON" | ConvertFrom-Json

# First, extract all sources for the sources table
$allSources = @()
$spellsJson | ForEach-Object {
    if ($_.source -and $_.source -ne "") {
        $sourceKey = $_.source.Trim()
        # Parse source into book and page
        $book = ""
        $page = $null
        
        if ($sourceKey -match "(.+?)\s+pg\.\s+(\d+)") {
            $book = $matches[1].Trim()
            $page = [int]$matches[2]
        } else {
            $book = $sourceKey
        }
        
        $allSources += [PSCustomObject]@{
            raw_text = $sourceKey
            book = $book
            page = $page
        }
    }
}

# Export sources CSV
$allSources | Export-Csv "db/seed/sources.csv" -NoTypeInformation -Encoding UTF8 -Force

# Create a lookup for sources by raw_text (use first occurrence)
$sourceLookup = @{}
$allSources | ForEach-Object {
    if (-not $sourceLookup.ContainsKey($_.raw_text)) {
        $sourceLookup[$_.raw_text] = $_
    }
}

# Convert spells with proper source_id reference
$spellsWithSource = $spellsJson | ForEach-Object {
    # Convert rank text to integer
    $rankInt = switch -Regex ($_.rank) {
        'Cantrip' { 0 }
        '(\d+)st' { [int]$matches[1] }
        '(\d+)nd' { [int]$matches[1] }
        '(\d+)rd' { [int]$matches[1] }
        '(\d+)th' { [int]$matches[1] }
        default { 0 }
    }
    
    # Convert defense to save_type enum
    $saveType = switch ($_.defense) {
        'Fortitude' { 'Fortitude' }
        'Reflex' { 'Reflex' }
        'Will' { 'Will' }
        'None' { 'None' }
        default { 'None' }
    }
    
    # Convert actions to action_category and parse min/max
    $actionCategory = switch -Regex ($_.actions) {
        '1 action' { 'Free' }
        '2 action' { 'Activity' }
        '3 action' { 'Activity' }
        'reaction' { 'Reaction' }
        default { 'Activity' }
    }
    
    # Parse actions_min and actions_max according to constraint
    $actionsMin = $null
    $actionsMax = $null
    if ($actionCategory -eq 'Activity') {
        if ($_.actions -match '(\d+)\s+action') {
            $actionsMin = [int]$matches[1]
            $actionsMax = $actionsMin
        } elseif ($_.actions -match '(\d+)\s+to\s+(\d+)\s+action') {
            $actionsMin = [int]$matches[1]
            $actionsMax = [int]$matches[2]
        }
        # Ensure values are within 1-3 range
        if ($actionsMin -lt 1) { $actionsMin = 1 }
        if ($actionsMax -gt 3) { $actionsMax = 3 }
        if ($actionsMin -gt $actionsMax) { $actionsMax = $actionsMin }
    } elseif ($actionCategory -in @('Free', 'Reaction')) {
        $actionsMin = 0
        $actionsMax = 0
    }
    # For 'None' category, both remain null
    
    # source_id will be populated via SQL join after import
    $sourceId = $null
    
    # Create custom object with proper column names and converted data
    [PSCustomObject]@{
        name = $_.name
        rank = $rankInt
        spell_type = $_.spell_type
        save_type = $saveType
        rarity = $_.rarity
        action_category = $actionCategory
        actions_min = $actionsMin
        actions_max = $actionsMax
        description = $_.summary
        source_id = $sourceId
    }
} | Export-Csv "db/seed/spells.csv" -NoTypeInformation -Encoding UTF8 -Force

Write-Host "Creating spell_traits lookup CSV..." -ForegroundColor Green

# Create spell_traits lookup CSV - with enhanced deduplication to prevent duplicate key violations
$spellTraits = @()
$spellTraitsSet = @{} # Use hashtable to track unique combinations
$duplicateCount = 0

$spellsJson | ForEach-Object {
    $spellName = $_.name
    if ($_.trait -and $_.trait -ne "") {
        $traits = $_.trait -split ',\s*'
        foreach ($trait in $traits) {
            $cleanTrait = $trait.Trim()
            if ($cleanTrait -ne "") {
                $key = "$spellName|$cleanTrait"
                if (-not $spellTraitsSet.ContainsKey($key)) {
                    $spellTraitsSet[$key] = $true
                    $spellTraits += [PSCustomObject]@{
                        spell_name = $spellName
                        trait_name = $cleanTrait
                    }
                } else {
                    $duplicateCount++
                    Write-Host "Duplicate found: $spellName - $cleanTrait" -ForegroundColor Red
                }
            }
        }
    }
}

Write-Host "Duplicates filtered out: $duplicateCount" -ForegroundColor Yellow
$spellTraits | Export-Csv "db/seed/spell_traits_helper.csv" -NoTypeInformation -Encoding UTF8 -Force

Write-Host "Creating spell_traditions lookup CSV..." -ForegroundColor Green

# Create spell_traditions lookup CSV - with enhanced deduplication to prevent duplicate key violations
$spellTraditions = @()
$spellTraditionsSet = @{} # Use hashtable to track unique combinations
$duplicateTraditionsCount = 0

$spellsJson | ForEach-Object {
    $spellName = $_.name
    if ($_.tradition -and $_.tradition -ne "") {
        $traditions = $_.tradition -split ',\s*'
        foreach ($tradition in $traditions) {
            $cleanTradition = $tradition.Trim()
            if ($cleanTradition -ne "") {
                $key = "$spellName|$cleanTradition"
                if (-not $spellTraditionsSet.ContainsKey($key)) {
                    $spellTraditionsSet[$key] = $true
                    $spellTraditions += [PSCustomObject]@{
                        spell_name = $spellName
                        tradition_name = $cleanTradition
                    }
                } else {
                    $duplicateTraditionsCount++
                    Write-Host "Duplicate found: $spellName - $cleanTradition" -ForegroundColor Red
                }
            }
        }
    }
}

Write-Host "Duplicates filtered out: $duplicateTraditionsCount" -ForegroundColor Yellow
$spellTraditions | Export-Csv "db/seed/spell_traditions_helper.csv" -NoTypeInformation -Encoding UTF8 -Force

# Remove duplicates from traits CSV - keep the one with the most complete description
Write-Host "Removing duplicate traits..." -ForegroundColor Green
$traits = Import-Csv "db/seed/traits.csv"

# Group by name and select the one with the longest description
$uniqueTraits = $traits | Group-Object name | ForEach-Object {
    $bestTrait = $_.Group | Sort-Object { $_.description.Length } -Descending | Select-Object -First 1
    $bestTrait
}

# Overwrite traits.csv with deduplicated data
$uniqueTraits | Export-Csv "db/seed/traits.csv" -NoTypeInformation -Encoding UTF8 -Force

Write-Host "CSV files created successfully!" -ForegroundColor Green
Write-Host "traits.csv: $((Get-Item 'db/seed/traits.csv').Length) bytes" -ForegroundColor Yellow
Write-Host "spells.csv: $((Get-Item 'db/seed/spells.csv').Length) bytes" -ForegroundColor Yellow
Write-Host "sources.csv: $((Get-Item 'db/seed/sources.csv').Length) bytes" -ForegroundColor Yellow
Write-Host "spell_traits_helper.csv: $((Get-Item 'db/seed/spell_traits_helper.csv').Length) bytes" -ForegroundColor Yellow
Write-Host "spell_traditions_helper.csv: $((Get-Item 'db/seed/spell_traditions_helper.csv').Length) bytes" -ForegroundColor Yellow
Write-Host "Original traits count: $($traits.Count)" -ForegroundColor Yellow
Write-Host "Final traits count: $($uniqueTraits.Count)" -ForegroundColor Green
Write-Host "Duplicates removed: $($traits.Count - $uniqueTraits.Count)" -ForegroundColor Yellow
Write-Host "Sources count: $($allSources.Count)" -ForegroundColor Green
Write-Host "Spell-traits relationships: $($spellTraits.Count)" -ForegroundColor Green
Write-Host "Spell-traditions relationships: $($spellTraditions.Count)" -ForegroundColor Green
Write-Host "Traits deduplicated and saved to: traits.csv" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "IMPORT ORDER FOR SUPABASE:" -ForegroundColor Cyan
Write-Host "1. traits.csv -> traits table" -ForegroundColor White
Write-Host "2. sources.csv -> sources table" -ForegroundColor White
Write-Host "3. spells.csv -> spells table" -ForegroundColor White
Write-Host "4. Use SQL to populate join tables and source_id:" -ForegroundColor White
Write-Host "   -- Update spells with source_id (manual process)" -ForegroundColor Gray
Write-Host "   -- For each spell, find its source in the sources table and update source_id" -ForegroundColor Gray
Write-Host "   -- Example: UPDATE spells SET source_id = (SELECT id FROM sources WHERE raw_text = 'Core Rulebook pg. 123') WHERE name = 'Spell Name';" -ForegroundColor Gray
Write-Host "" -ForegroundColor White
Write-Host "   INSERT INTO spell_traits (spell_id, trait_id)" -ForegroundColor Gray
Write-Host "   SELECT s.id, t.id FROM spells s" -ForegroundColor Gray
Write-Host "   JOIN spell_traits_helper sth ON s.name = sth.spell_name" -ForegroundColor Gray
Write-Host "   JOIN traits t ON t.name = sth.trait_name;" -ForegroundColor Gray
Write-Host "" -ForegroundColor White
Write-Host "   INSERT INTO spell_traditions (spell_id, tradition_id)" -ForegroundColor Gray
Write-Host "   SELECT s.id, tr.id FROM spells s" -ForegroundColor Gray
Write-Host "   JOIN spell_traditions_helper sth ON s.name = sth.spell_name" -ForegroundColor Gray
Write-Host "   JOIN traditions tr ON tr.name = sth.tradition_name;" -ForegroundColor Gray
Write-Host "" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "IMPORTANT: The spell_traits_helper.csv and spell_traditions_helper.csv files contain" -ForegroundColor Yellow
Write-Host "spell_name and trait_name/tradition_name columns for SQL joining." -ForegroundColor Yellow
Write-Host "They are NOT direct imports - use the SQL commands above to populate the tables." -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "CSV HEADERS MATCH DATABASE:" -ForegroundColor Cyan
Write-Host "• sources.csv: raw_text, book, page" -ForegroundColor White
Write-Host "• traits.csv: name, description" -ForegroundColor White
Write-Host "• spells.csv: name, rank, spell_type, save_type, rarity, action_category, actions_min, actions_max, description, source_id" -ForegroundColor White
Write-Host "• spell_traits.csv: spell_name, trait_name (lookup data for SQL)" -ForegroundColor White
Write-Host "• spell_traditions.csv: spell_name, tradition_name (lookup data for SQL)" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Note: Import the CSV files first, then use the SQL commands above to populate join tables and source_id." -ForegroundColor Yellow
