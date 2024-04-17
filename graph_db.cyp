CREATE CONSTRAINT FOR (c:Customer) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT FOR (m:Merchant) REQUIRE m.id IS UNIQUE;

:auto
CALL apoc.periodic.iterate(
  'LOAD CSV WITH HEADERS FROM "file:///bs140513_032310.csv" AS line
   WITH line,
        SPLIT(line.customer, "\'") AS customerID,
        SPLIT(line.merchant, "\'") AS merchantID,
        SPLIT(line.age, "\'") AS customerAge,
        SPLIT(line.gender, "\'") AS customerGender,
        SPLIT(line.category, "\'") AS transCategory
   RETURN line, customerID, merchantID, customerAge, customerGender, transCategory',
  'WITH line, customerID, merchantID, customerAge, customerGender, transCategory
   MERGE (customer:Customer {id: customerID[1], age: customerAge[1], gender: customerGender[1]})
   MERGE (merchant:Merchant {id: merchantID[1]})
   CREATE (transaction:Transaction {amount: line.amount, fraud: line.fraud, category: transCategory[1], step: line.step})-[:WITH]->(merchant)
   CREATE (customer)-[:PERFORMS]->(transaction)',
  {batchSize: 1000, iterateList: true}
)
YIELD total
RETURN count(*);

MATCH (c1:Customer)-[:PERFORMS]->(t1:Transaction)-[:WITH]->(m1:Merchant)
WITH c1, m1
MERGE (p1:Placeholder {id: m1.id})

MATCH (c1:Customer)-[:PERFORMS]->(t1:Transaction)-[:WITH]->(m1:Merchant)
WITH c1, m1, count(*) as cnt
MERGE (p2:Placeholder {id:c1.id})

MATCH (c1:Customer)-[:PERFORMS]->(t1:Transaction)-[:WITH]->(m1:Merchant)
WITH c1, m1, count(*) as cnt
MATCH (p1:Placeholder {id:m1.id})
WITH c1, m1, p1, cnt
MATCH (p2:Placeholder {id: c1.id})
WITH c1, m1, p1, p2, cnt
CREATE (p2)-[:PAYS {cnt: cnt}]->(p1)

MATCH (c1:Customer)-[:PERFORMS]->(t1:Transaction)-[:WITH]->(m1:Merchant)
WITH c1, m1, count(*) as cnt
MATCH (p1:Placeholder {id:c1.id})
WITH c1, m1, p1, cnt
MATCH (p2:Placeholder {id: m1.id})
WITH c1, m1, p1, p2, cnt
CREATE (p1)-[:PAYS {cnt: cnt}]->(p2)

//Creating Graph
CALL gds.graph.project(
  'myGraph',
  'Placeholder',
  {
    relationshipProperties: 'PAYS'
  }
)

// Computing PageRank for placeholder nodes
CALL gds.pageRank.write('myGraph', {
  maxIterations: 20,
  dampingFactor: 0.85,
  writeProperty: 'pagerank'
})

// Viewing the PageRank results
MATCH (p:Placeholder)
RETURN p.id AS id, p.pagerank as pagerank
ORDER BY pagerank DESC

CALL gds.pageRank.stream('myGraph', {
  maxIterations:20, dampingFactor:0.85
})
YIELD nodeId, score

// Computing the degree of each node
MATCH (p:Placeholder)
SET p.degree = apoc.node.degree(p, 'PAYS')

// Community detection using label propagation
CALL gds.labelPropagation.write('myGraph', {
    writeProperty: 'community'
})

MATCH (p:Placeholder)
RETURN p.id AS id, p.pagerank as pagerank, p.degree as degree, p.community as community

// Computing node similarity
CALL gds.nodeSimilarity.write('myGraph', {
    writeRelationshipType: 'PAYS',
    writeProperty: 'similarity'
})

// Query to obtain the relationships of a particular customer node
match (c1:Customer)-[:PERFORMS]->(t1:Transaction)-[:WITH]->(m1:Merchant)
where c1.id = "C2054744914"
return c1, t1, m1