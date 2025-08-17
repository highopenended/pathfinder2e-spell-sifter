Order of Operations

1) First, we'll migrate the tables into Supabase. In Supabase, navigate to this project and then to the SQL editor. In order of their file numbering, copy and paste in each of the migration files and run the code. This will generate our enums, tables, indexes, and views.


2) In the seed directory, delete all of the csv files (listed below)
  - sources.csv
  - spell_traditions_helper.csv
  - spell_traits_helper.csv
  - spells.csv
  - traits.csv)


3) In the terminal (powershell), run our convert_to_csv.ps1 script to generate new csv files to replace those than we deleted
  - npm run convert-csv


4) Next, navigate to Table Editor in Supabase, we will be importing csv data directly here. Go to each of the following tables and we'll import core data from the associated csv:
  - sources                 ->  sources.csv
  - spells                  ->  spells.csv
  - traits                  ->  traits.csv
  - spell_traditions_helper ->  spell_traditions_helper.csv
  - spell_traits_helper     ->  spell_traits_helper.csv

6) Note that we did NOT import anything for spell_traditions or spell_traits. These will be handled with scripts. Navigate back to the SQL Editor and copy and paste the following code and run it for the final two tables to populate them from their associated helper tables:

  - Spell_traditions (populating from spell_traditions_helper)
        INSERT INTO spell_traditions (spell_id, tradition_id)
        SELECT s.id, t.id
        FROM spells s
        JOIN spell_traditions_helper sth ON sth.spell_name = s.name
        JOIN traditions t ON t.name = sth.tradition_name;

  - Spell_traits (populating from spell_traits_helper)
        INSERT INTO spell_traits (spell_id, trait_id)
        SELECT s.id, t.id
        FROM spells s
        JOIN spell_traits_helper sth ON sth.spell_name = s.name
        JOIN traits t ON t.name = sth.trait_name;


7) Finally, we can remove the helper tables:
  - DROP TABLE spell_traditions_helper;
  - DROP TABLE spell_traits_helper;
