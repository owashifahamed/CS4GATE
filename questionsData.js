const questionsData = [
  {
    "id": 1,
    "course": "Theory of Computation",
    "chapter": "Pushdown Automata",
    "topic": "DPDA",
    "section": "PYQ",
    "year": "2025",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>Which of the following language is accepted by a \u003cb>\u003cu>Deterministic Pushdown Automata?\u003c/u>\u003c/b>\u003c/p>",
    "options": [
      "Any regular language.",
      "Any context free language.",
      "Any language accepted by a non-deterministic pushdown automaton.",
      "Any decidable language."
    ],
    "answer": "Any regular language.",
    "theory": "\u003ch3>Difference Between DPDA and NPDA\u003c/h3>\u003cp>\u003cb>L(DFA) = L(NFA) &sub; L(DPDA) &sub; L(NPDA) &sub; L(LBA) &sub; L(TM)\u003c/b>\u003c/p>\u003cul>\u003cli>Regular languages are accepted by DFA, NFA, DPDA, NPDA, LBA and TM.\u003c/li>\u003cli>Deterministic context-free languages are accepted by DPDA, NPDA, LBA and TM.\u003c/li>\u003cli>Context-free languages are accepted by NPDA, LBA and TM.\u003c/li>\u003c/ul>",
    "solution": "\u003cul>\u003cli>\u003cb>Option A:\u003c/b> Any regular language. Correct. Regular languages are accepted by DPDA.\u003c/li>\u003cli>\u003cb>Option B:\u003c/b> Any context free language. Wrong. DPDA accepts only deterministic context-free languages.\u003c/li>\u003cli>\u003cb>Option C:\u003c/b> Wrong. NPDA accepts more languages than DPDA.\u003c/li>\u003cli>\u003cb>Option D:\u003c/b> Wrong. DPDA does not accept every decidable language.\u003c/li>\u003c/ul>",
    "updated_at": "2026-05-28 13:40:00"
  },
  {
    "id": 2,
    "course": "Data Structures",
    "chapter": "Stacks",
    "topic": "Stack Operations",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>A stack follows which of the following principles?\u003c/p>",
    "options": [
      "FIFO",
      "LIFO",
      "Priority Based",
      "Random Access"
    ],
    "answer": "LIFO",
    "theory": "\u003ch3>Stack\u003c/h3>\u003cp>A stack is a linear data structure where insertion and deletion take place at the same end called TOP.\u003c/p>",
    "solution": "\u003cul>\u003cli>Stack insertion is PUSH.\u003c/li>\u003cli>Deletion is POP.\u003c/li>\u003cli>The last inserted element is removed first.\u003c/li>\u003cli>Hence Stack follows Last In First Out (LIFO).\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 3,
    "course": "Data Structures",
    "chapter": "Queues",
    "topic": "Queue Operations",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>If elements 10, 20, 30 and 40 are inserted into an empty queue and one deletion operation is performed, which element will be deleted?\u003c/p>",
    "options": [
      "10",
      "20",
      "30",
      "40"
    ],
    "answer": "10",
    "theory": "\u003ch3>Queue\u003c/h3>\u003cp>A queue follows the FIFO (First In First Out) principle. The first element inserted is the first one removed.\u003c/p>",
    "solution": "\u003cul>\u003cli>Elements are inserted in the order: 10, 20, 30, 40.\u003c/li>\u003cli>Queue deletion removes the element at the front.\u003c/li>\u003cli>The first inserted element is 10.\u003c/li>\u003cli>Therefore, 10 will be deleted.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 4,
    "course": "Data Structures",
    "chapter": "Trees",
    "topic": "Binary Trees",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>A full binary tree contains 15 nodes. How many leaf nodes does it have?\u003c/p>",
    "options": [
      "7",
      "8",
      "9",
      "10"
    ],
    "answer": "8",
    "theory": "\u003ch3>Full Binary Tree\u003c/h3>\u003cp>In a full binary tree, every node has either 0 or 2 children. The number of leaf nodes can be calculated using the relation: Leaf Nodes = (Total Nodes + 1) / 2.\u003c/p>",
    "solution": "\u003cul>\u003cli>Total nodes = 15.\u003c/li>\u003cli>Leaf Nodes = (15 + 1) / 2.\u003c/li>\u003cli>= 16 / 2.\u003c/li>\u003cli>= 8.\u003c/li>\u003cli>Therefore, the number of leaf nodes is 8.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 5,
    "course": "Data Structures",
    "chapter": "Binary Search Tree",
    "topic": "BST Search",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>What is the worst-case time complexity of searching for an element in a Binary Search Tree (BST) containing n nodes?\u003c/p>",
    "options": [
      "O(log n)",
      "O(1)",
      "O(n)",
      "O(n log n)"
    ],
    "answer": "O(n)",
    "theory": "\u003ch3>Binary Search Tree (BST)\u003c/h3>\u003cp>A Binary Search Tree allows efficient searching when balanced. However, if the tree becomes skewed, its height can become n.\u003c/p>",
    "solution": "\u003cul>\u003cli>In a balanced BST, search complexity is O(log n).\u003c/li>\u003cli>In the worst case, the BST becomes skewed like a linked list.\u003c/li>\u003cli>The height of the tree becomes n.\u003c/li>\u003cli>All nodes may need to be visited.\u003c/li>\u003cli>Therefore, the worst-case complexity is O(n).\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 6,
    "course": "Data Structures",
    "chapter": "Hashing",
    "topic": "Hash Tables",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which of the following data structures provides average-case O(1) search time complexity?\u003c/p>",
    "options": [
      "Linked List",
      "Hash Table",
      "Binary Search Tree",
      "Stack"
    ],
    "answer": "Hash Table",
    "theory": "\u003ch3>Hashing\u003c/h3>\u003cp>Hashing uses a hash function to map keys to indices in a table, allowing fast insertion, deletion and searching operations.\u003c/p>",
    "solution": "\u003cul>\u003cli>Linked List search requires traversing nodes, giving O(n) complexity.\u003c/li>\u003cli>Binary Search Tree search depends on tree height.\u003c/li>\u003cli>Stack does not support direct searching efficiently.\u003c/li>\u003cli>Hash Tables provide average-case O(1) lookup using hash functions.\u003c/li>\u003cli>Therefore, the correct answer is Hash Table.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 7,
    "course": "Algorithms",
    "chapter": "Asymptotic Analysis",
    "topic": "Time Complexity",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>Which of the following grows fastest as n becomes very large?\u003c/p>",
    "options": [
      "n log n",
      "nÂ²",
      "2^n",
      "nÂ³"
    ],
    "answer": "2^n",
    "theory": "\u003ch3>Growth of Functions\u003c/h3>\u003cp>Exponential functions grow faster than polynomial and logarithmic functions.\u003c/p>",
    "solution": "\u003cul>\u003cli>n log n is smaller than nÂ².\u003c/li>\u003cli>nÂ² is smaller than nÂ³.\u003c/li>\u003cli>Exponential growth dominates polynomial growth.\u003c/li>\u003cli>Therefore 2^n grows fastest.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 8,
    "course": "Algorithms",
    "chapter": "Searching",
    "topic": "Binary Search",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>What is the worst-case time complexity of Binary Search on a sorted array of n elements?\u003c/p>",
    "options": [
      "O(n)",
      "O(log n)",
      "O(n log n)",
      "O(1)"
    ],
    "answer": "O(log n)",
    "theory": "\u003ch3>Binary Search\u003c/h3>\u003cp>Binary Search repeatedly divides the search space into two equal halves until the element is found or the search space becomes empty.\u003c/p>",
    "solution": "\u003cul>\u003cli>Each comparison reduces the search space by half.\u003c/li>\u003cli>The sequence becomes n, n/2, n/4, n/8, ...\u003c/li>\u003cli>The number of divisions required is log n.\u003c/li>\u003cli>Therefore, the complexity is O(log n).\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 9,
    "course": "Algorithms",
    "chapter": "Sorting",
    "topic": "Merge Sort",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>What is the worst-case time complexity of Merge Sort?\u003c/p>",
    "options": [
      "O(nÂ²)",
      "O(log n)",
      "O(n log n)",
      "O(n)"
    ],
    "answer": "O(n log n)",
    "theory": "\u003ch3>Merge Sort\u003c/h3>\u003cp>Merge Sort uses the divide-and-conquer strategy by recursively dividing the array and then merging sorted subarrays.\u003c/p>",
    "solution": "\u003cul>\u003cli>Recurrence relation: T(n) = 2T(n/2) + O(n).\u003c/li>\u003cli>Using the Master Theorem, a=2 and b=2.\u003c/li>\u003cli>f(n)=n.\u003c/li>\u003cli>Therefore T(n)=O(n log n).\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 10,
    "course": "Algorithms",
    "chapter": "Greedy Algorithms",
    "topic": "Activity Selection",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>The Activity Selection Problem is optimally solved using which design technique?\u003c/p>",
    "options": [
      "Dynamic Programming",
      "Greedy Method",
      "Backtracking",
      "Branch and Bound"
    ],
    "answer": "Greedy Method",
    "theory": "\u003ch3>Greedy Algorithms\u003c/h3>\u003cp>The Activity Selection Problem chooses the maximum number of non-overlapping activities by repeatedly selecting the activity that finishes earliest.\u003c/p>",
    "solution": "\u003cul>\u003cli>Sort activities according to finishing times.\u003c/li>\u003cli>Select the earliest finishing activity.\u003c/li>\u003cli>Choose the next compatible activity.\u003c/li>\u003cli>This greedy choice leads to an optimal solution.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 11,
    "course": "Algorithms",
    "chapter": "Graph Algorithms",
    "topic": "Dijkstra Algorithm",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Dijkstra's shortest path algorithm may produce incorrect results when the graph contains:\u003c/p>",
    "options": [
      "Undirected edges",
      "Weighted edges",
      "Negative edge weights",
      "Cycles"
    ],
    "answer": "Negative edge weights",
    "theory": "\u003ch3>Dijkstra Algorithm\u003c/h3>\u003cp>Dijkstra's algorithm assumes that once a shortest distance is finalized, it will never decrease later.\u003c/p>",
    "solution": "\u003cul>\u003cli>Negative edge weights can reduce a previously finalized distance.\u003c/li>\u003cli>This violates Dijkstra's assumption.\u003c/li>\u003cli>Hence the algorithm may fail.\u003c/li>\u003cli>Bellman-Ford algorithm is preferred for graphs with negative weights.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 12,
    "course": "DBMS",
    "chapter": "Normalization",
    "topic": "Functional Dependency",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>Which normal form removes partial dependency from a relation?\u003c/p>",
    "options": [
      "1NF",
      "2NF",
      "3NF",
      "BCNF"
    ],
    "answer": "2NF",
    "theory": "\u003ch3>Second Normal Form (2NF)\u003c/h3>\u003cp>A relation is in 2NF if it is in 1NF and every non-prime attribute is fully functionally dependent on the entire candidate key.\u003c/p>",
    "solution": "\u003cul>\u003cli>1NF removes repeating groups.\u003c/li>\u003cli>2NF removes partial dependencies.\u003c/li>\u003cli>3NF removes transitive dependencies.\u003c/li>\u003cli>Hence the correct answer is 2NF.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 13,
    "course": "DBMS",
    "chapter": "SQL",
    "topic": "Aggregate Functions",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>Which SQL aggregate function returns the number of rows in a table?\u003c/p>",
    "options": [
      "SUM()",
      "AVG()",
      "COUNT()",
      "MAX()"
    ],
    "answer": "COUNT()",
    "theory": "\u003ch3>Aggregate Functions\u003c/h3>\u003cp>Aggregate functions perform calculations on multiple rows and return a single value.\u003c/p>",
    "solution": "\u003cul>\u003cli>SUM() calculates total value.\u003c/li>\u003cli>AVG() calculates average.\u003c/li>\u003cli>COUNT() counts rows.\u003c/li>\u003cli>Therefore COUNT() is correct.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 14,
    "course": "DBMS",
    "chapter": "Transactions",
    "topic": "ACID Properties",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which ACID property ensures that a transaction is either completed fully or not executed at all?\u003c/p>",
    "options": [
      "Consistency",
      "Isolation",
      "Durability",
      "Atomicity"
    ],
    "answer": "Atomicity",
    "theory": "\u003ch3>ACID Properties\u003c/h3>\u003cp>Atomicity guarantees all-or-nothing execution of a transaction.\u003c/p>",
    "solution": "\u003cul>\u003cli>A transaction consists of multiple operations.\u003c/li>\u003cli>Either all operations succeed or all fail.\u003c/li>\u003cli>No partial execution is allowed.\u003c/li>\u003cli>This property is called Atomicity.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 15,
    "course": "DBMS",
    "chapter": "Indexing",
    "topic": "B+ Trees",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which indexing structure is most commonly used in modern database systems?\u003c/p>",
    "options": [
      "Linked List",
      "Hash Table",
      "B+ Tree",
      "Stack"
    ],
    "answer": "B+ Tree",
    "theory": "\u003ch3>B+ Tree\u003c/h3>\u003cp>B+ Trees provide efficient search, insertion, deletion and range queries.\u003c/p>",
    "solution": "\u003cul>\u003cli>B+ Trees keep all records at leaf level.\u003c/li>\u003cli>Leaf nodes are linked for efficient range queries.\u003c/li>\u003cli>Height remains small even for large datasets.\u003c/li>\u003cli>Therefore B+ Tree is widely used.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 16,
    "course": "DBMS",
    "chapter": "ER Model",
    "topic": "Keys",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which key uniquely identifies each record in a relation?\u003c/p>",
    "options": [
      "Foreign Key",
      "Primary Key",
      "Composite Key",
      "Alternate Key"
    ],
    "answer": "Primary Key",
    "theory": "\u003ch3>Primary Key\u003c/h3>\u003cp>A primary key uniquely identifies each tuple in a relation and cannot contain duplicate values.\u003c/p>",
    "solution": "\u003cul>\u003cli>Foreign Key establishes relationships.\u003c/li>\u003cli>Composite Key contains multiple attributes.\u003c/li>\u003cli>Alternate Key is a candidate key not selected as primary.\u003c/li>\u003cli>Primary Key uniquely identifies every record.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 17,
    "course": "Operating System",
    "chapter": "Process Management",
    "topic": "Process States",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>Which process state indicates that a process is waiting for an event such as I/O completion?\u003c/p>",
    "options": [
      "Running",
      "Ready",
      "Blocked",
      "Terminated"
    ],
    "answer": "Blocked",
    "theory": "\u003ch3>Process States\u003c/h3>\u003cp>A blocked process cannot execute until a specific event occurs.\u003c/p>",
    "solution": "\u003cul>\u003cli>Running means CPU is executing the process.\u003c/li>\u003cli>Ready means waiting for CPU allocation.\u003c/li>\u003cli>Blocked means waiting for an event such as I/O completion.\u003c/li>\u003cli>Therefore the answer is Blocked.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 18,
    "course": "Operating System",
    "chapter": "CPU Scheduling",
    "topic": "Scheduling Algorithms",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>Which CPU scheduling algorithm may cause starvation of long processes?\u003c/p>",
    "options": [
      "FCFS",
      "Round Robin",
      "Shortest Job First",
      "FIFO"
    ],
    "answer": "Shortest Job First",
    "theory": "\u003ch3>Shortest Job First\u003c/h3>\u003cp>SJF selects the process with the smallest burst time.\u003c/p>",
    "solution": "\u003cul>\u003cli>Short jobs are always preferred.\u003c/li>\u003cli>Long jobs may continuously wait if short jobs keep arriving.\u003c/li>\u003cli>This condition is called starvation.\u003c/li>\u003cli>Hence SJF may cause starvation.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 19,
    "course": "Operating System",
    "chapter": "Deadlocks",
    "topic": "Deadlock Conditions",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which of the following is NOT one of Coffman's necessary conditions for deadlock?\u003c/p>",
    "options": [
      "Mutual Exclusion",
      "Hold and Wait",
      "Preemption",
      "Circular Wait"
    ],
    "answer": "Preemption",
    "theory": "\u003ch3>Deadlock\u003c/h3>\u003cp>Coffman's conditions are Mutual Exclusion, Hold and Wait, No Preemption and Circular Wait.\u003c/p>",
    "solution": "\u003cul>\u003cli>Mutual Exclusion is required.\u003c/li>\u003cli>Hold and Wait is required.\u003c/li>\u003cli>No Preemption is required.\u003c/li>\u003cli>Circular Wait is required.\u003c/li>\u003cli>Therefore Preemption is not a deadlock condition.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 20,
    "course": "Operating System",
    "chapter": "Memory Management",
    "topic": "Paging",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Paging eliminates which memory allocation problem?\u003c/p>",
    "options": [
      "External Fragmentation",
      "Internal Fragmentation",
      "Thrashing",
      "Deadlock"
    ],
    "answer": "External Fragmentation",
    "theory": "\u003ch3>Paging\u003c/h3>\u003cp>Paging divides memory into fixed-size pages and frames.\u003c/p>",
    "solution": "\u003cul>\u003cli>Pages can be placed in any free frame.\u003c/li>\u003cli>Contiguous allocation is not required.\u003c/li>\u003cli>Hence external fragmentation is eliminated.\u003c/li>\u003cli>Small internal fragmentation may still exist.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 21,
    "course": "Operating System",
    "chapter": "Virtual Memory",
    "topic": "Page Replacement",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which page replacement algorithm replaces the page that has not been used for the longest period of time?\u003c/p>",
    "options": [
      "FIFO",
      "Optimal",
      "LRU",
      "Round Robin"
    ],
    "answer": "LRU",
    "theory": "\u003ch3>Least Recently Used (LRU)\u003c/h3>\u003cp>LRU assumes that pages not used recently are less likely to be used soon.\u003c/p>",
    "solution": "\u003cul>\u003cli>FIFO removes the oldest page.\u003c/li>\u003cli>Optimal removes the page needed farthest in the future.\u003c/li>\u003cli>LRU removes the least recently used page.\u003c/li>\u003cli>Therefore the correct answer is LRU.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 22,
    "course": "Computer Networks",
    "chapter": "OSI Model",
    "topic": "Network Layers",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>Which layer of the OSI model is responsible for end-to-end process communication?\u003c/p>",
    "options": [
      "Network Layer",
      "Transport Layer",
      "Session Layer",
      "Data Link Layer"
    ],
    "answer": "Transport Layer",
    "theory": "\u003ch3>Transport Layer\u003c/h3>\u003cp>The Transport Layer provides end-to-end communication services, segmentation, flow control and error control.\u003c/p>",
    "solution": "\u003cul>\u003cli>Network Layer handles routing.\u003c/li>\u003cli>Data Link Layer handles node-to-node communication.\u003c/li>\u003cli>Transport Layer provides end-to-end process communication.\u003c/li>\u003cli>Hence the correct answer is Transport Layer.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 23,
    "course": "Computer Networks",
    "chapter": "TCP/IP",
    "topic": "TCP",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>TCP is a ______ protocol.\u003c/p>",
    "options": [
      "Connectionless and Unreliable",
      "Connection-Oriented and Reliable",
      "Connectionless and Reliable",
      "Connection-Oriented and Unreliable"
    ],
    "answer": "Connection-Oriented and Reliable",
    "theory": "\u003ch3>TCP\u003c/h3>\u003cp>TCP establishes a connection before data transfer and provides reliable delivery using acknowledgements and retransmissions.\u003c/p>",
    "solution": "\u003cul>\u003cli>TCP performs a three-way handshake.\u003c/li>\u003cli>It uses sequence numbers and acknowledgements.\u003c/li>\u003cli>Lost packets are retransmitted.\u003c/li>\u003cli>Therefore TCP is connection-oriented and reliable.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 24,
    "course": "Computer Networks",
    "chapter": "Routing",
    "topic": "Shortest Path",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which routing algorithm is used by OSPF to compute shortest paths?\u003c/p>",
    "options": [
      "Bellman-Ford Algorithm",
      "Prim's Algorithm",
      "Kruskal's Algorithm",
      "Dijkstra's Algorithm"
    ],
    "answer": "Dijkstra's Algorithm",
    "theory": "\u003ch3>OSPF\u003c/h3>\u003cp>OSPF is a link-state routing protocol that uses Dijkstra's shortest path algorithm.\u003c/p>",
    "solution": "\u003cul>\u003cli>OSPF maintains a complete topology database.\u003c/li>\u003cli>It computes shortest paths using Dijkstra's algorithm.\u003c/li>\u003cli>The result is a shortest path tree.\u003c/li>\u003cli>Therefore the correct answer is Dijkstra's Algorithm.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 25,
    "course": "Computer Networks",
    "chapter": "Data Link Layer",
    "topic": "Error Detection",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which error detection technique is widely used in Ethernet frames?\u003c/p>",
    "options": [
      "Parity Bit",
      "Checksum",
      "CRC",
      "Hamming Code"
    ],
    "answer": "CRC",
    "theory": "\u003ch3>Cyclic Redundancy Check (CRC)\u003c/h3>\u003cp>CRC is a powerful error-detection mechanism commonly used in network protocols.\u003c/p>",
    "solution": "\u003cul>\u003cli>CRC treats data as a binary polynomial.\u003c/li>\u003cli>The sender appends a remainder.\u003c/li>\u003cli>The receiver performs the same division.\u003c/li>\u003cli>A non-zero remainder indicates an error.\u003c/li>\u003cli>Hence CRC is correct.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 26,
    "course": "Computer Networks",
    "chapter": "Application Layer",
    "topic": "DNS",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>What is the primary function of DNS in the Internet?\u003c/p>",
    "options": [
      "Route packets between networks",
      "Assign IP addresses dynamically",
      "Translate domain names into IP addresses",
      "Encrypt network traffic"
    ],
    "answer": "Translate domain names into IP addresses",
    "theory": "\u003ch3>Domain Name System (DNS)\u003c/h3>\u003cp>DNS provides a hierarchical naming system that maps human-readable domain names to IP addresses.\u003c/p>",
    "solution": "\u003cul>\u003cli>Users remember domain names such as example.com.\u003c/li>\u003cli>Computers communicate using IP addresses.\u003c/li>\u003cli>DNS resolves domain names into IP addresses.\u003c/li>\u003cli>Therefore the correct answer is domain-to-IP translation.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 27,
    "course": "Computer Organization",
    "chapter": "Number Systems",
    "topic": "Binary Arithmetic",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>What is the decimal equivalent of the binary number 101101?\u003c/p>",
    "options": [
      "43",
      "45",
      "47",
      "49"
    ],
    "answer": "45",
    "theory": "\u003ch3>Binary to Decimal Conversion\u003c/h3>\u003cp>Each binary digit represents a power of 2 based on its position.\u003c/p>",
    "solution": "\u003cul>\u003cli>101101_2= 1Ã—2^5+ 0Ã—2^4+ 1Ã—2Â³ + 1Ã—2Â² + 0Ã—2Â¹ + 1Ã—2^0\u003c/li>\u003cli>= 32 + 0 + 8 + 4 + 0 + 1\u003c/li>\u003cli>= 45\u003c/li>\u003cli>Therefore the decimal equivalent is 45.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 28,
    "course": "Computer Organization",
    "chapter": "CPU Organization",
    "topic": "Registers",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>Which register holds the address of the next instruction to be executed?\u003c/p>",
    "options": [
      "MAR",
      "MDR",
      "Program Counter",
      "Accumulator"
    ],
    "answer": "Program Counter",
    "theory": "\u003ch3>Program Counter (PC)\u003c/h3>\u003cp>The Program Counter stores the memory address of the next instruction to be fetched.\u003c/p>",
    "solution": "\u003cul>\u003cli>MAR stores memory addresses for memory operations.\u003c/li>\u003cli>MDR stores data being transferred.\u003c/li>\u003cli>Accumulator stores intermediate results.\u003c/li>\u003cli>Program Counter stores the next instruction address.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 29,
    "course": "Computer Organization",
    "chapter": "Cache Memory",
    "topic": "Cache Performance",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Cache memory is primarily used to:\u003c/p>",
    "options": [
      "Increase secondary storage capacity",
      "Reduce average memory access time",
      "Store operating system files",
      "Replace RAM"
    ],
    "answer": "Reduce average memory access time",
    "theory": "\u003ch3>Cache Memory\u003c/h3>\u003cp>Cache is a small high-speed memory placed between CPU and main memory.\u003c/p>",
    "solution": "\u003cul>\u003cli>CPU accesses cache before main memory.\u003c/li>\u003cli>Frequently used data is stored in cache.\u003c/li>\u003cli>This reduces memory access latency.\u003c/li>\u003cli>Therefore cache reduces average memory access time.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 30,
    "course": "Computer Organization",
    "chapter": "Instruction Set Architecture",
    "topic": "Addressing Modes",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>In which addressing mode is the operand explicitly specified within the instruction itself?\u003c/p>",
    "options": [
      "Direct Addressing",
      "Indirect Addressing",
      "Immediate Addressing",
      "Indexed Addressing"
    ],
    "answer": "Immediate Addressing",
    "theory": "\u003ch3>Immediate Addressing\u003c/h3>\u003cp>The actual operand value is part of the instruction.\u003c/p>",
    "solution": "\u003cul>\u003cli>Example: MOV R1, #10\u003c/li>\u003cli>Here 10 is directly present in the instruction.\u003c/li>\u003cli>No memory lookup is required for the operand.\u003c/li>\u003cli>Hence this is Immediate Addressing.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 31,
    "course": "Computer Organization",
    "chapter": "Pipelining",
    "topic": "Pipeline Hazards",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>A data hazard in instruction pipelining occurs when:\u003c/p>",
    "options": [
      "Two instructions require the same hardware resource",
      "The next instruction depends on the result of a previous instruction",
      "A branch instruction changes control flow",
      "Cache memory becomes full"
    ],
    "answer": "The next instruction depends on the result of a previous instruction",
    "theory": "\u003ch3>Data Hazard\u003c/h3>\u003cp>Data hazards arise when instructions depend on the results of earlier instructions still in the pipeline.\u003c/p>",
    "solution": "\u003cul>\u003cli>Instruction I2 may need data produced by I1.\u003c/li>\u003cli>If I1 has not completed, I2 cannot proceed safely.\u003c/li>\u003cli>This dependency creates a data hazard.\u003c/li>\u003cli>Forwarding and stalling are common solutions.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 32,
    "course": "Theory of Computation",
    "chapter": "Finite Automata",
    "topic": "DFA",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>Which class of languages is accepted by a Deterministic Finite Automaton (DFA)?\u003c/p>",
    "options": [
      "Regular Languages",
      "Context-Free Languages",
      "Context-Sensitive Languages",
      "Recursively Enumerable Languages"
    ],
    "answer": "Regular Languages",
    "theory": "\u003ch3>Finite Automata\u003c/h3>\u003cp>DFA and NFA are equivalent computational models that recognize exactly the class of regular languages.\u003c/p>",
    "solution": "\u003cul>\u003cli>DFA has a finite number of states.\u003c/li>\u003cli>It processes input symbol by symbol.\u003c/li>\u003cli>DFA recognizes exactly regular languages.\u003c/li>\u003cli>Therefore the correct answer is Regular Languages.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 33,
    "course": "Theory of Computation",
    "chapter": "Regular Expressions",
    "topic": "Language Representation",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>The regular expression (0+1)* represents:\u003c/p>",
    "options": [
      "All binary strings",
      "Only strings of 0s",
      "Only strings of 1s",
      "Only even length strings"
    ],
    "answer": "All binary strings",
    "theory": "\u003ch3>Regular Expressions\u003c/h3>\u003cp>The Kleene star allows zero or more occurrences of symbols from the given set.\u003c/p>",
    "solution": "\u003cul>\u003cli>(0+1) means either 0 or 1.\u003c/li>\u003cli>* means zero or more repetitions.\u003c/li>\u003cli>Any combination of 0s and 1s is possible.\u003c/li>\u003cli>Hence it represents all binary strings.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 34,
    "course": "Theory of Computation",
    "chapter": "Context Free Grammar",
    "topic": "CFG",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which machine accepts Context-Free Languages?\u003c/p>",
    "options": [
      "DFA",
      "NFA",
      "Pushdown Automaton",
      "Finite State Transducer"
    ],
    "answer": "Pushdown Automaton",
    "theory": "\u003ch3>Pushdown Automata\u003c/h3>\u003cp>A Pushdown Automaton (PDA) is a finite automaton equipped with a stack.\u003c/p>",
    "solution": "\u003cul>\u003cli>Regular languages are accepted by DFA/NFA.\u003c/li>\u003cli>Context-Free Languages require additional memory.\u003c/li>\u003cli>PDA provides a stack for memory.\u003c/li>\u003cli>Therefore PDA accepts CFLs.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 35,
    "course": "Theory of Computation",
    "chapter": "Turing Machine",
    "topic": "Computability",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>A Turing Machine is more powerful than a Finite Automaton because it:\u003c/p>",
    "options": [
      "Has infinite states",
      "Has a stack",
      "Has an infinite tape for memory",
      "Can execute faster"
    ],
    "answer": "Has an infinite tape for memory",
    "theory": "\u003ch3>Turing Machine\u003c/h3>\u003cp>Turing Machines use an unbounded tape that acts as unlimited memory.\u003c/p>",
    "solution": "\u003cul>\u003cli>Finite Automata have no external memory.\u003c/li>\u003cli>Turing Machines use a read-write tape.\u003c/li>\u003cli>The tape can grow indefinitely.\u003c/li>\u003cli>Hence Turing Machines are more powerful.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 36,
    "course": "Theory of Computation",
    "chapter": "Grammar",
    "topic": "Ambiguity",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>A context-free grammar is said to be ambiguous if:\u003c/p>",
    "options": [
      "It contains left recursion",
      "It has more than one start symbol",
      "A string can have more than one parse tree",
      "It generates a finite language"
    ],
    "answer": "A string can have more than one parse tree",
    "theory": "\u003ch3>Ambiguous Grammar\u003c/h3>\u003cp>A grammar is ambiguous if at least one string generated by it has multiple valid parse trees.\u003c/p>",
    "solution": "\u003cul>\u003cli>Different parse trees imply different derivations.\u003c/li>\u003cli>The same string can be interpreted in multiple ways.\u003c/li>\u003cli>This creates ambiguity.\u003c/li>\u003cli>Therefore the correct answer is multiple parse trees.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 37,
    "course": "Compiler Design",
    "chapter": "Lexical Analysis",
    "topic": "Tokens",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>The output of the lexical analyzer is:\u003c/p>",
    "options": [
      "Parse Tree",
      "Tokens",
      "Intermediate Code",
      "Machine Code"
    ],
    "answer": "Tokens",
    "theory": "\u003ch3>Lexical Analysis\u003c/h3>\u003cp>The lexical analyzer scans the source program and converts character sequences into meaningful tokens.\u003c/p>",
    "solution": "\u003cul>\u003cli>Lexical analyzer is the first phase of a compiler.\u003c/li>\u003cli>It groups characters into lexemes.\u003c/li>\u003cli>Each lexeme is converted into a token.\u003c/li>\u003cli>Therefore the output is Tokens.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 38,
    "course": "Compiler Design",
    "chapter": "Parsing",
    "topic": "Top Down Parsing",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>Which parsing technique constructs the parse tree from root to leaves?\u003c/p>",
    "options": [
      "Bottom-Up Parsing",
      "Shift Reduce Parsing",
      "Top-Down Parsing",
      "Operator Precedence Parsing"
    ],
    "answer": "Top-Down Parsing",
    "theory": "\u003ch3>Top-Down Parsing\u003c/h3>\u003cp>Top-down parsers begin with the start symbol and expand productions toward the input string.\u003c/p>",
    "solution": "\u003cul>\u003cli>Parsing starts from the start symbol.\u003c/li>\u003cli>Production rules are applied recursively.\u003c/li>\u003cli>The parse tree grows from root to leaves.\u003c/li>\u003cli>Hence the answer is Top-Down Parsing.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 39,
    "course": "Compiler Design",
    "chapter": "Parsing",
    "topic": "LL(1) Parser",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Left recursion must be eliminated before constructing an LL(1) parser because:\u003c/p>",
    "options": [
      "It increases memory usage",
      "It causes infinite recursion",
      "It changes the language",
      "It makes parsing slower"
    ],
    "answer": "It causes infinite recursion",
    "theory": "\u003ch3>LL(1) Parsing\u003c/h3>\u003cp>Recursive-descent parsers cannot handle left-recursive grammars directly.\u003c/p>",
    "solution": "\u003cul>\u003cli>Consider A ->AA alpha | beta\u003c/li>\u003cli>The parser repeatedly expands A.\u003c/li>\u003cli>This leads to infinite recursion.\u003c/li>\u003cli>Therefore left recursion must be removed.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 40,
    "course": "Compiler Design",
    "chapter": "Syntax Directed Translation",
    "topic": "Intermediate Code",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which of the following is a commonly used intermediate code representation?\u003c/p>",
    "options": [
      "Assembly Code",
      "Machine Code",
      "Three Address Code",
      "Object Code"
    ],
    "answer": "Three Address Code",
    "theory": "\u003ch3>Intermediate Code Generation\u003c/h3>\u003cp>Intermediate code is machine-independent and simplifies optimization.\u003c/p>",
    "solution": "\u003cul>\u003cli>Three Address Code uses statements with at most three operands.\u003c/li>\u003cli>It is easy to optimize.\u003c/li>\u003cli>It is machine-independent.\u003c/li>\u003cli>Therefore Three Address Code is correct.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 41,
    "course": "Compiler Design",
    "chapter": "Code Optimization",
    "topic": "Optimization Techniques",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which optimization technique replaces repeated computation of the same expression by a single computed value?\u003c/p>",
    "options": [
      "Dead Code Elimination",
      "Loop Unrolling",
      "Common Subexpression Elimination",
      "Register Allocation"
    ],
    "answer": "Common Subexpression Elimination",
    "theory": "\u003ch3>Common Subexpression Elimination\u003c/h3>\u003cp>If an expression is evaluated multiple times and operands do not change, the result can be reused.\u003c/p>",
    "solution": "\u003cul>\u003cli>Example: a+b appears multiple times.\u003c/li>\u003cli>Compute it once and store the result.\u003c/li>\u003cli>Reuse the stored value later.\u003c/li>\u003cli>This reduces computation cost.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 42,
    "course": "Discrete Mathematics",
    "chapter": "Logic",
    "topic": "Propositional Logic",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>Which logical operator is represented by the symbol âˆ§?\u003c/p>",
    "options": [
      "OR",
      "NOT",
      "IMPLICATION",
      "AND"
    ],
    "answer": "AND",
    "theory": "\u003ch3>Logical Connectives\u003c/h3>\u003cp>The symbol âˆ§represents conjunction, which is true only when both operands are true.\u003c/p>",
    "solution": "\u003cul>\u003cli>âˆ§denotes conjunction.\u003c/li>\u003cli>Conjunction corresponds to logical AND.\u003c/li>\u003cli>Both statements must be true.\u003c/li>\u003cli>Therefore the answer is AND.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 43,
    "course": "Discrete Mathematics",
    "chapter": "Sets",
    "topic": "Set Operations",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>If A = {1,2,3} and B = {3,4,5}, then A âˆ©B is:\u003c/p>",
    "options": [
      "{1,2,3,4,5}",
      "{3}",
      "{1,2}",
      "{4,5}"
    ],
    "answer": "{3}",
    "theory": "\u003ch3>Intersection of Sets\u003c/h3>\u003cp>The intersection of two sets contains elements common to both sets.\u003c/p>",
    "solution": "\u003cul>\u003cli>A = {1,2,3}\u003c/li>\u003cli>B = {3,4,5}\u003c/li>\u003cli>Common element = 3\u003c/li>\u003cli>Therefore A âˆ©B = {3}.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 44,
    "course": "Discrete Mathematics",
    "chapter": "Relations",
    "topic": "Equivalence Relation",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>A relation is called an equivalence relation if it is:\u003c/p>",
    "options": [
      "Reflexive and Symmetric",
      "Symmetric and Transitive",
      "Reflexive, Symmetric and Transitive",
      "Only Transitive"
    ],
    "answer": "Reflexive, Symmetric and Transitive",
    "theory": "\u003ch3>Equivalence Relation\u003c/h3>\u003cp>An equivalence relation must satisfy reflexivity, symmetry and transitivity.\u003c/p>",
    "solution": "\u003cul>\u003cli>Reflexive: aRa for every a.\u003c/li>\u003cli>Symmetric: aRb implies bRa.\u003c/li>\u003cli>Transitive: aRb and bRc imply aRc.\u003c/li>\u003cli>All three properties are required.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 45,
    "course": "Discrete Mathematics",
    "chapter": "Graph Theory",
    "topic": "Graph Basics",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>In an undirected graph, the sum of degrees of all vertices is equal to:\u003c/p>",
    "options": [
      "Number of vertices",
      "Number of edges",
      "Twice the number of edges",
      "Square of number of edges"
    ],
    "answer": "Twice the number of edges",
    "theory": "\u003ch3>Handshaking Lemma\u003c/h3>\u003cp>The sum of degrees of all vertices in an undirected graph equals twice the number of edges.\u003c/p>",
    "solution": "\u003cul>\u003cli>Each edge contributes degree 1 to two vertices.\u003c/li>\u003cli>Hence every edge contributes 2 to total degree.\u003c/li>\u003cli>Total degree sum = 2E.\u003c/li>\u003cli>Therefore the answer is twice the number of edges.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 46,
    "course": "Discrete Mathematics",
    "chapter": "Combinatorics",
    "topic": "Permutations",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>How many different ways can 5 distinct books be arranged on a shelf?\u003c/p>",
    "options": [
      "25",
      "60",
      "120",
      "125"
    ],
    "answer": "120",
    "theory": "\u003ch3>Permutations\u003c/h3>\u003cp>The number of arrangements of n distinct objects is n!.\u003c/p>",
    "solution": "\u003cul>\u003cli>Number of books = 5.\u003c/li>\u003cli>Required arrangements = 5!.\u003c/li>\u003cli>5! = 5 Ã— 4 Ã— 3 Ã— 2 Ã— 1 = 120.\u003c/li>\u003cli>Therefore the answer is 120.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 47,
    "course": "Digital Electronics",
    "chapter": "Number Systems",
    "topic": "Binary Numbers",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>What is the decimal equivalent of the binary number 1101?\u003c/p>",
    "options": [
      "11",
      "12",
      "13",
      "14"
    ],
    "answer": "13",
    "theory": "\u003ch3>Binary to Decimal Conversion\u003c/h3>\u003cp>Each binary digit represents a power of 2.\u003c/p>",
    "solution": "\u003cul>\u003cli>1101_2= 1Ã—2Â³ + 1Ã—2Â² + 0Ã—2Â¹ + 1Ã—2^0\u003c/li>\u003cli>= 8 + 4 + 0 + 1\u003c/li>\u003cli>= 13\u003c/li>\u003cli>Therefore the answer is 13.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 48,
    "course": "Digital Electronics",
    "chapter": "Logic Gates",
    "topic": "Basic Gates",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>Which logic gate produces output 1 only when all inputs are 1?\u003c/p>",
    "options": [
      "OR Gate",
      "XOR Gate",
      "AND Gate",
      "NOR Gate"
    ],
    "answer": "AND Gate",
    "theory": "\u003ch3>AND Gate\u003c/h3>\u003cp>An AND gate outputs HIGH only when every input is HIGH.\u003c/p>",
    "solution": "\u003cul>\u003cli>AND gate follows logical multiplication.\u003c/li>\u003cli>1 AND 1 = 1.\u003c/li>\u003cli>Any input 0 makes output 0.\u003c/li>\u003cli>Hence AND Gate is correct.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 49,
    "course": "Digital Electronics",
    "chapter": "Boolean Algebra",
    "topic": "Boolean Laws",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>According to Boolean Algebra, A + A' equals:\u003c/p>",
    "options": [
      "0",
      "A",
      "A'",
      "1"
    ],
    "answer": "1",
    "theory": "\u003ch3>Complement Law\u003c/h3>\u003cp>One of the fundamental Boolean identities is A + A' = 1.\u003c/p>",
    "solution": "\u003cul>\u003cli>A' represents the complement of A.\u003c/li>\u003cli>If A=0 then A'=1.\u003c/li>\u003cli>If A=1 then A'=0.\u003c/li>\u003cli>In both cases A+A'=1.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 50,
    "course": "Digital Electronics",
    "chapter": "Combinational Circuits",
    "topic": "Multiplexers",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>A 4-to-1 multiplexer requires how many select lines?\u003c/p>",
    "options": [
      "1",
      "2",
      "3",
      "4"
    ],
    "answer": "2",
    "theory": "\u003ch3>Multiplexer\u003c/h3>\u003cp>A multiplexer with n input lines requires log2(n) select lines.\u003c/p>",
    "solution": "\u003cul>\u003cli>Number of inputs = 4.\u003c/li>\u003cli>Select lines = log2(4).\u003c/li>\u003cli>= 2.\u003c/li>\u003cli>Therefore a 4-to-1 MUX requires 2 select lines.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 51,
    "course": "Digital Electronics",
    "chapter": "Sequential Circuits",
    "topic": "Flip-Flops",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which flip-flop eliminates the invalid state present in the SR flip-flop?\u003c/p>",
    "options": [
      "SR Flip-Flop",
      "D Flip-Flop",
      "T Flip-Flop",
      "JK Flip-Flop"
    ],
    "answer": "JK Flip-Flop",
    "theory": "\u003ch3>JK Flip-Flop\u003c/h3>\u003cp>The JK flip-flop is an improved version of the SR flip-flop and removes the invalid state.\u003c/p>",
    "solution": "\u003cul>\u003cli>SR flip-flop has an invalid condition when S=R=1.\u003c/li>\u003cli>JK flip-flop modifies this behavior.\u003c/li>\u003cli>When J=K=1, the output toggles.\u003c/li>\u003cli>Therefore JK flip-flop eliminates the invalid state.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 52,
    "course": "Engineering Mathematics",
    "chapter": "Linear Algebra",
    "topic": "Matrices",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>For a square matrix A, if det(A) = 0, then A is:\u003c/p>",
    "options": [
      "Orthogonal",
      "Singular",
      "Identity",
      "Symmetric"
    ],
    "answer": "Singular",
    "theory": "\u003ch3>Determinants\u003c/h3>\u003cp>A matrix is singular if its determinant is zero, implying that its inverse does not exist.\u003c/p>",
    "solution": "\u003cul>\u003cli>det(A)=0.\u003c/li>\u003cli>Inverse exists only when det(A) `âˆ 0.\u003c/li>\u003cli>Therefore A is non-invertible.\u003c/li>\u003cli>Such a matrix is called Singular.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 53,
    "course": "Engineering Mathematics",
    "chapter": "Calculus",
    "topic": "Differentiation",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>What is the derivative of xÂ² with respect to x?\u003c/p>",
    "options": [
      "x",
      "2x",
      "xÂ²",
      "2"
    ],
    "answer": "2x",
    "theory": "\u003ch3>Differentiation\u003c/h3>\u003cp>For f(x)=x^n, the derivative is n*x^(n-1).\u003c/p>",
    "solution": "\u003cul>\u003cli>f(x)=xÂ².\u003c/li>\u003cli>Using the power rule:\u003c/li>\u003cli>d(xÂ²)/dx = 2xÂ¹.\u003c/li>\u003cli>= 2x.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 54,
    "course": "Engineering Mathematics",
    "chapter": "Probability",
    "topic": "Basic Probability",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>A fair coin is tossed once. What is the probability of getting a Head?\u003c/p>",
    "options": [
      "0",
      "1/4",
      "1/2",
      "1"
    ],
    "answer": "1/2",
    "theory": "\u003ch3>Probability\u003c/h3>\u003cp>Probability = (Number of Favorable Outcomes)/(Total Number of Outcomes).\u003c/p>",
    "solution": "\u003cul>\u003cli>Total outcomes = {H, T} = 2.\u003c/li>\u003cli>Favorable outcomes for Head = 1.\u003c/li>\u003cli>Probability = 1/2.\u003c/li>\u003cli>Therefore the answer is 1/2.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 55,
    "course": "Engineering Mathematics",
    "chapter": "Differential Equations",
    "topic": "Order and Degree",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>What is the order of the differential equation dÂ²y/dxÂ² + 3dy/dx + y = 0 ?\u003c/p>",
    "options": [
      "1",
      "2",
      "3",
      "0"
    ],
    "answer": "2",
    "theory": "\u003ch3>Order of Differential Equation\u003c/h3>\u003cp>The order is the highest derivative present in the equation.\u003c/p>",
    "solution": "\u003cul>\u003cli>The equation contains dÂ²y/dxÂ².\u003c/li>\u003cli>This is the highest derivative.\u003c/li>\u003cli>Its order is 2.\u003c/li>\u003cli>Hence the answer is 2.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 56,
    "course": "Engineering Mathematics",
    "chapter": "Discrete Probability",
    "topic": "Expectation",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>If X is a fair six-sided die outcome, then E[X] is:\u003c/p>",
    "options": [
      "3",
      "3.5",
      "4",
      "4.5"
    ],
    "answer": "3.5",
    "theory": "\u003ch3>Expected Value\u003c/h3>\u003cp>The expected value of a discrete random variable is the weighted average of all possible outcomes.\u003c/p>",
    "solution": "\u003cul>\u003cli>E[X] = (1+2+3+4+5+6)/6\u003c/li>\u003cli>= 21/6\u003c/li>\u003cli>= 3.5\u003c/li>\u003cli>Therefore the expected value is 3.5.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 57,
    "course": "General Aptitude",
    "chapter": "Quantitative Aptitude",
    "topic": "Percentage",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>A student's marks increase from 80 to 100. What is the percentage increase?\u003c/p>",
    "options": [
      "20%",
      "25%",
      "30%",
      "40%"
    ],
    "answer": "25%",
    "theory": "\u003ch3>Percentage Increase\u003c/h3>\u003cp>Percentage Increase = ((New Value - Old Value) / Old Value) Ã— 100\u003c/p>",
    "solution": "\u003cul>\u003cli>Old marks = 80\u003c/li>\u003cli>New marks = 100\u003c/li>\u003cli>Increase = 100 - 80 = 20\u003c/li>\u003cli>Percentage Increase = (20/80) Ã— 100 = 25%\u003c/li>\u003cli>Therefore the answer is 25%.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 58,
    "course": "General Aptitude",
    "chapter": "Quantitative Aptitude",
    "topic": "Ratio and Proportion",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>If A:B = 3:5 and B:C = 10:7, then A:B:C is:\u003c/p>",
    "options": [
      "3:5:7",
      "6:10:7",
      "3:10:7",
      "6:5:7"
    ],
    "answer": "6:10:7",
    "theory": "\u003ch3>Ratio Combination\u003c/h3>\u003cp>To combine ratios, make the common term equal and then merge the ratios.\u003c/p>",
    "solution": "\u003cul>\u003cli>A:B = 3:5\u003c/li>\u003cli>B:C = 10:7\u003c/li>\u003cli>LCM of 5 and 10 = 10\u003c/li>\u003cli>Multiply first ratio by 2 ->A:B = 6:10\u003c/li>\u003cli>Therefore A:B:C = 6:10:7\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 59,
    "course": "General Aptitude",
    "chapter": "Logical Reasoning",
    "topic": "Series",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Find the next number in the series: 2, 6, 12, 20, 30, ?\u003c/p>",
    "options": [
      "40",
      "42",
      "44",
      "48"
    ],
    "answer": "42",
    "theory": "\u003ch3>Number Series\u003c/h3>\u003cp>Observe the differences between consecutive terms.\u003c/p>",
    "solution": "\u003cul>\u003cli>6 - 2 = 4\u003c/li>\u003cli>12 - 6 = 6\u003c/li>\u003cli>20 - 12 = 8\u003c/li>\u003cli>30 - 20 = 10\u003c/li>\u003cli>Next difference = 12\u003c/li>\u003cli>30 + 12 = 42\u003c/li>\u003cli>Therefore the answer is 42.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 60,
    "course": "General Aptitude",
    "chapter": "Verbal Ability",
    "topic": "Synonyms",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Select the synonym of the word \u003cb>ABUNDANT\u003c/b>.\u003c/p>",
    "options": [
      "Scarce",
      "Plentiful",
      "Rare",
      "Limited"
    ],
    "answer": "Plentiful",
    "theory": "\u003ch3>Synonyms\u003c/h3>\u003cp>A synonym is a word having the same or nearly the same meaning as another word.\u003c/p>",
    "solution": "\u003cul>\u003cli>Abundant means existing in large quantities.\u003c/li>\u003cli>Plentiful means available in abundance.\u003c/li>\u003cli>Both words have similar meanings.\u003c/li>\u003cli>Therefore the correct answer is Plentiful.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 61,
    "course": "General Aptitude",
    "chapter": "Quantitative Aptitude",
    "topic": "Time and Work",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>A can complete a work in 10 days and B can complete the same work in 15 days. In how many days can they complete the work together?\u003c/p>",
    "options": [
      "5 days",
      "6 days",
      "7 days",
      "8 days"
    ],
    "answer": "6 days",
    "theory": "\u003ch3>Time and Work\u003c/h3>\u003cp>Combined work rate = Sum of individual work rates.\u003c/p>",
    "solution": "\u003cul>\u003cli>A's work rate = 1/10\u003c/li>\u003cli>B's work rate = 1/15\u003c/li>\u003cli>Combined rate = 1/10 + 1/15 = 5/30 = 1/6\u003c/li>\u003cli>Time required = 6 days\u003c/li>\u003cli>Therefore the answer is 6 days.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 62,
    "course": "Programming & Data Structures in C",
    "chapter": "C Basics",
    "topic": "Variables and Data Types",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Easy",
    "question": "\u003cp>What is the size of the \u003ccode>char\u003c/code> data type in C?\u003c/p>",
    "options": [
      "1 byte",
      "2 bytes",
      "4 bytes",
      "8 bytes"
    ],
    "answer": "1 byte",
    "theory": "\u003ch3>Character Data Type\u003c/h3>\u003cp>In C, a char occupies exactly 1 byte of memory and is used to store a single character.\u003c/p>",
    "solution": "\u003cul>\u003cli>The C standard defines sizeof(char) as 1 byte.\u003c/li>\u003cli>It stores a single character such as 'A' or 'b'.\u003c/li>\u003cli>Therefore the size of char is 1 byte.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 63,
    "course": "Programming & Data Structures in C",
    "chapter": "Pointers",
    "topic": "Pointer Basics",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>What will be the value of x after executing the following code?\u003cbr>\u003ccode>int x = 10; int *p = &x; *p = 20;\u003c/code>\u003c/p>",
    "options": [
      "10",
      "20",
      "0",
      "Compilation Error"
    ],
    "answer": "20",
    "theory": "\u003ch3>Pointers\u003c/h3>\u003cp>A pointer stores the memory address of another variable. Dereferencing a pointer allows modification of the variable it points to.\u003c/p>",
    "solution": "\u003cul>\u003cli>x is initialized to 10.\u003c/li>\u003cli>p stores the address of x.\u003c/li>\u003cli>*p = 20 updates the value at that address.\u003c/li>\u003cli>Therefore x becomes 20.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 64,
    "course": "Programming & Data Structures in C",
    "chapter": "Arrays",
    "topic": "Array Indexing",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Given \u003ccode>int arr[5] = {10,20,30,40,50};\u003c/code>, what is the value of \u003ccode>arr[2]\u003c/code>?\u003c/p>",
    "options": [
      "10",
      "20",
      "30",
      "40"
    ],
    "answer": "30",
    "theory": "\u003ch3>Arrays\u003c/h3>\u003cp>Array indexing in C starts from 0. The first element is at index 0.\u003c/p>",
    "solution": "\u003cul>\u003cli>arr[0] = 10\u003c/li>\u003cli>arr[1] = 20\u003c/li>\u003cli>arr[2] = 30\u003c/li>\u003cli>Therefore the value of arr[2] is 30.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 65,
    "course": "Programming & Data Structures in C",
    "chapter": "Linked Lists",
    "topic": "Data Structures",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>Which of the following is an advantage of a linked list over an array?\u003c/p>",
    "options": [
      "Random access in O(1)",
      "Fixed memory size",
      "Dynamic memory allocation",
      "Lower memory usage always"
    ],
    "answer": "Dynamic memory allocation",
    "theory": "\u003ch3>Linked Lists\u003c/h3>\u003cp>Linked lists allocate memory dynamically and can grow or shrink during program execution.\u003c/p>",
    "solution": "\u003cul>\u003cli>Arrays have fixed size after creation.\u003c/li>\u003cli>Linked lists allocate nodes dynamically.\u003c/li>\u003cli>Insertion and deletion are easier.\u003c/li>\u003cli>Hence dynamic memory allocation is the advantage.\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  },
  {
    "id": 66,
    "course": "Programming & Data Structures in C",
    "chapter": "Stacks",
    "topic": "Stack Operations",
    "section": "Practice",
    "year": "2026",
    "type": "MCQ",
    "difficulty": "Medium",
    "question": "\u003cp>A stack follows which principle?\u003c/p>",
    "options": [
      "FIFO",
      "LIFO",
      "Round Robin",
      "Priority Based"
    ],
    "answer": "LIFO",
    "theory": "\u003ch3>Stack\u003c/h3>\u003cp>A stack is a linear data structure in which the last inserted element is the first one removed.\u003c/p>",
    "solution": "\u003cul>\u003cli>Elements are inserted using PUSH.\u003c/li>\u003cli>Elements are removed using POP.\u003c/li>\u003cli>The most recently inserted element is removed first.\u003c/li>\u003cli>Therefore a stack follows LIFO (Last In First Out).\u003c/li>\u003c/ul>",
    "updated_at": "2026-06-03 12:00:00"
  }
];

(function () {
  "use strict";

  if (typeof module !== "undefined") module.exports = questionsData;
  if (typeof window === "undefined") return;

  window.questionsData = questionsData;
  window.questionsDataStatus = {
    ready: true,
    ok: true,
    source: "static",
    error: ""
  };

  window.questionsDataReady = Promise.resolve(questionsData);
})();


