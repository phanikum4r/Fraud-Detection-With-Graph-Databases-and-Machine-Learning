# Fraud-Detection-With-Graph-Databases-and-Machine-Learning
This project was carried out as part of the CSE 573: Semantic Wwb Mining course for the Spring 2024 semester at ASU.

# Folder Structure
- Code: Contains the Python notebook files for execution and cypher file.
    - Data_Preparation_for_Visualizations.ipynb: File for getting visualizations.
    - fraud_detection.ipynb: Script to run Algorithms using intrinsic Graph features.
    - fraud_detection_graph_db.ipynb: Script to run Algorithms using Network features of the Graph.
    - graph_db.cyp: Neo4j queries for creating Graph model.    
- Data: Contains the dataset required for execution.
- Evaluations: Files used to create a Dashboard for visualization.

# Graph Database Connection
- Install Neo4j Desktop ~v 1.5.9
- Install the required plugins
    - APOC library ~v 5.19.0 (for loading data from CSV in batches)
    - Graph Data Science library ~v 2.6.5 (for various network features algorithms)
- Execute the code snippet from [graph_db.cyp](CODE/graph_db.cyp)
