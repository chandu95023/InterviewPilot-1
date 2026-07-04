from typing import List
import json
import logging
import ast
from ..core.config import settings

logger = logging.getLogger(__name__)

import time
import requests
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
# Treat placeholder key as unavailable
GEMINI_AVAILABLE = bool(GEMINI_API_KEY) and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY"

def call_gemini(prompt: str, max_retries: int = 3) -> str:
    if not GEMINI_AVAILABLE:
        raise Exception("Gemini API key not configured")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024}
    }
    
    for attempt in range(max_retries):
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 429:
            logger.warning(f"429 Too Many Requests. Retrying in {2 ** attempt} seconds...")
            time.sleep(2 ** attempt)
            continue
            
        response.raise_for_status()
        data = response.json()
        
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError):
            raise Exception(f"Unexpected response format from Gemini: {data}")
            
    raise Exception("Max retries exceeded for Gemini API (429 Rate Limit)")

import base64

def transcribe_audio_with_gemini(audio_data: bytes, mime_type: str) -> str:
    if not GEMINI_AVAILABLE or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
        logger.warning("Gemini not available, using mock audio transcription")
        return "This is a simulated transcript since the Gemini API key is missing. The candidate demonstrated a clear understanding of the subject but could improve their articulation speed."
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    
    encoded_audio = base64.b64encode(audio_data).decode("utf-8")
    
    payload = {
        "contents": [{
            "parts": [
                {
                    "inlineData": {
                        "mimeType": mime_type,
                        "data": encoded_audio
                    }
                },
                {
                    "text": "Transcribe the audio exactly as spoken. Output ONLY the transcription text. Do not add any greetings, preamble, or comments."
                }
            ]
        }]
    }
    
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()
    data = response.json()
    
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError):
        raise Exception(f"Unexpected response format from Gemini: {data}")

# Domain-specific fallback questions when Gemini is unavailable
DOMAIN_QUESTIONS = {
    "Python": [
        {"question": "Explain the difference between lists and tuples in Python.", "ideal_answer": "Lists are mutable, ordered collections defined with [] brackets, while tuples are immutable, ordered collections defined with (). Tuples are hashable and can be used as dictionary keys."},
        {"question": "What are Python decorators and how do they work?", "ideal_answer": "Decorators are functions that modify the behavior of other functions. They take a function as input and return a new function. They use the @decorator syntax and are commonly used for logging, authentication, and caching."},
        {"question": "Explain Python's GIL (Global Interpreter Lock).", "ideal_answer": "The GIL is a mutex that protects access to Python objects, preventing multiple threads from executing Python bytecode simultaneously. It limits true parallelism in CPU-bound multi-threaded programs. Use multiprocessing or async for parallelism."},
        {"question": "What are generators in Python and why are they useful?", "ideal_answer": "Generators are functions that yield values one at a time using the yield keyword, creating iterators lazily. They are memory efficient because they don't store all values in memory at once, making them ideal for large datasets."},
        {"question": "How does Python memory management work?", "ideal_answer": "Python uses reference counting and a cyclic garbage collector. Objects are allocated on a private heap. Reference counting tracks how many references point to an object, and the GC handles circular references."},
        {"question": "Explain list comprehensions vs generator expressions.", "ideal_answer": "List comprehensions create the entire list in memory using [expr for x in iterable], while generator expressions use (expr for x in iterable) and produce values lazily, consuming less memory."},
        {"question": "What is the difference between *args and **kwargs?", "ideal_answer": "*args collects positional arguments into a tuple, while **kwargs collects keyword arguments into a dictionary. They allow functions to accept variable numbers of arguments."},
        {"question": "Explain Python's context managers and the 'with' statement.", "ideal_answer": "Context managers handle resource setup and teardown using __enter__ and __exit__ methods. The 'with' statement ensures proper cleanup even if exceptions occur. Common uses include file handling and database connections."},
        {"question": "What are metaclasses in Python?", "ideal_answer": "Metaclasses are classes of classes that define how classes behave. They are created using the type() function or by inheriting from type. They control class creation and can modify class attributes and methods."},
        {"question": "Describe a time when you had to debug a complex Python issue. How did you approach it?", "ideal_answer": "A strong answer describes the specific issue, the debugging methodology used (logging, pdb, profiling), how they isolated the root cause, and what they learned from the experience."},
    ],
    "Java": [
        {"question": "Explain the difference between JDK, JRE, and JVM.", "ideal_answer": "JVM is the virtual machine that runs bytecode. JRE includes JVM plus standard libraries for running Java programs. JDK includes JRE plus development tools like javac compiler and debugging tools."},
        {"question": "What is the difference between HashMap and ConcurrentHashMap?", "ideal_answer": "HashMap is not thread-safe, while ConcurrentHashMap uses segment-level locking for thread safety without locking the entire map. ConcurrentHashMap doesn't allow null keys or values."},
        {"question": "Explain Java's garbage collection mechanisms.", "ideal_answer": "Java uses generational GC with Young (Eden, Survivor) and Old generations. Minor GC collects young generation, Major GC collects old generation. GC algorithms include Serial, Parallel, CMS, G1, and ZGC."},
        {"question": "What are functional interfaces in Java 8+?", "ideal_answer": "Functional interfaces have exactly one abstract method and can be used with lambda expressions. Examples include Runnable, Callable, Predicate, Function, and Consumer. Annotated with @FunctionalInterface."},
        {"question": "Explain the SOLID principles with Java examples.", "ideal_answer": "S: Single Responsibility, O: Open-Closed, L: Liskov Substitution, I: Interface Segregation, D: Dependency Inversion. Each principle guides class design for maintainable, extensible code."},
        {"question": "What is the difference between checked and unchecked exceptions?", "ideal_answer": "Checked exceptions must be caught or declared (IOException, SQLException). Unchecked exceptions extend RuntimeException and don't require explicit handling (NullPointerException, ArrayIndexOutOfBoundsException)."},
        {"question": "Explain the Java Stream API and its benefits.", "ideal_answer": "Streams provide a functional approach to processing collections. They support operations like filter, map, reduce, and collect. Benefits include declarative code, lazy evaluation, and easy parallelism with parallelStream()."},
        {"question": "How does the volatile keyword work in Java?", "ideal_answer": "volatile ensures visibility of changes across threads by preventing caching of variables. It guarantees happens-before ordering but doesn't provide atomicity for compound operations like increment."},
        {"question": "What are design patterns you've used in production Java code?", "ideal_answer": "Common patterns include Singleton, Factory, Builder, Observer, Strategy, and Dependency Injection. A good answer includes specific use cases and trade-offs."},
        {"question": "How do you handle high-concurrency scenarios in Java?", "ideal_answer": "Use concurrent collections, thread pools (ExecutorService), locks (ReentrantLock), atomic variables, CompletableFuture for async, and proper synchronization strategies."},
    ],
    "JavaScript": [
        {"question": "Explain closures in JavaScript with an example.", "ideal_answer": "A closure is a function that retains access to its outer scope's variables even after the outer function has returned. This enables data encapsulation and factory functions."},
        {"question": "What is the event loop in JavaScript?", "ideal_answer": "The event loop continuously checks the call stack and task queues. When the stack is empty, it processes microtasks (Promises) first, then macrotasks (setTimeout, I/O). This enables non-blocking async execution."},
        {"question": "Explain the difference between var, let, and const.", "ideal_answer": "var is function-scoped with hoisting, let is block-scoped and can be reassigned, const is block-scoped and cannot be reassigned (but objects/arrays can be mutated)."},
        {"question": "What are Promises and how do they differ from callbacks?", "ideal_answer": "Promises represent eventual completion/failure of async operations. They chain with .then()/.catch(), avoiding callback hell. They have three states: pending, fulfilled, rejected."},
        {"question": "Explain prototypal inheritance in JavaScript.", "ideal_answer": "Objects inherit directly from other objects via the prototype chain. Each object has a [[Prototype]] reference. When a property is accessed, JS walks up the prototype chain until found or null."},
        {"question": "What is the difference between == and ===?", "ideal_answer": "== performs type coercion before comparison, while === checks both value and type without coercion. Always prefer === for predictable comparisons."},
        {"question": "Explain async/await and how it works under the hood.", "ideal_answer": "async/await is syntactic sugar over Promises. async functions return Promises, await pauses execution until the Promise resolves. Under the hood, it uses generators and the microtask queue."},
        {"question": "What is the 'this' keyword and how does it behave?", "ideal_answer": "this refers to the execution context. In methods, it refers to the object. In functions, it depends on strict mode (undefined vs global). Arrow functions inherit this from the enclosing scope."},
        {"question": "Explain how you would optimize a slow JavaScript application.", "ideal_answer": "Profile with DevTools, reduce DOM manipulation, use requestAnimationFrame, implement code splitting, lazy loading, debounce/throttle events, optimize bundle size, use Web Workers for CPU tasks."},
        {"question": "Tell me about a challenging JavaScript bug you solved.", "ideal_answer": "A strong answer describes a specific async/scope/memory issue, the debugging tools used, the root cause analysis, and the solution implemented."},
    ],
    "React": [
        {"question": "Explain the Virtual DOM and how React uses it.", "ideal_answer": "The Virtual DOM is an in-memory representation of the real DOM. React creates a virtual tree, diffs it with the previous version (reconciliation), and only updates changed nodes in the real DOM for performance."},
        {"question": "What are React Hooks and why were they introduced?", "ideal_answer": "Hooks let functional components use state and lifecycle features. They were introduced to simplify component logic, enable code reuse via custom hooks, and avoid class component complexity."},
        {"question": "Explain the difference between useEffect and useLayoutEffect.", "ideal_answer": "useEffect runs asynchronously after the browser paints, while useLayoutEffect runs synchronously after DOM mutations but before paint. Use useLayoutEffect for DOM measurements and visual updates."},
        {"question": "What is React's Context API and when should you use it?", "ideal_answer": "Context provides a way to pass data through the component tree without prop drilling. Use it for global state like themes, auth, or locale. For complex state, consider Redux or Zustand."},
        {"question": "How does React's reconciliation algorithm work?", "ideal_answer": "React uses a diffing algorithm comparing two trees. It assumes elements of different types produce different trees and uses keys to identify list items. This achieves O(n) complexity instead of O(n^3)."},
        {"question": "Explain useMemo and useCallback. When should you use them?", "ideal_answer": "useMemo memoizes computed values, useCallback memoizes functions. Use them to prevent unnecessary recalculations or re-renders, especially when passing props to React.memo components."},
        {"question": "What are the common performance optimization techniques in React?", "ideal_answer": "React.memo for component memoization, useMemo/useCallback, lazy loading with Suspense, code splitting, virtualized lists, avoiding unnecessary state updates, and proper key usage."},
        {"question": "Explain how you would handle form state in a React application.", "ideal_answer": "Options include controlled components with useState, useReducer for complex forms, libraries like React Hook Form or Formik, and uncontrolled components with refs. Trade-offs involve performance vs control."},
        {"question": "What is the difference between client-side and server-side rendering in React?", "ideal_answer": "CSR renders in the browser with JavaScript. SSR renders HTML on the server for faster initial load and better SEO. Frameworks like Next.js provide SSR, SSG, and ISR capabilities."},
        {"question": "Describe a complex React component you built and the challenges you faced.", "ideal_answer": "A strong answer discusses component design decisions, state management approach, performance considerations, testing strategy, and lessons learned."},
    ],
    "Node.js": [
        {"question": "Explain the Node.js event-driven architecture.", "ideal_answer": "Node.js uses a single-threaded event loop with non-blocking I/O. It delegates I/O operations to libuv's thread pool, then processes callbacks when operations complete, enabling high concurrency."},
        {"question": "What is the difference between require() and import in Node.js?", "ideal_answer": "require() is CommonJS (synchronous, dynamic), import is ES Modules (static, async by default). ES Modules support tree-shaking and are the modern standard. Node.js supports both."},
        {"question": "Explain middleware in Express.js.", "ideal_answer": "Middleware functions have access to req, res, and next(). They execute sequentially in the order defined. Used for logging, authentication, error handling, body parsing, and CORS."},
        {"question": "How do you handle errors in Node.js applications?", "ideal_answer": "Use try/catch for sync code, .catch() for Promises, error-first callbacks, centralized error handling middleware in Express, process.on('uncaughtException'), and proper logging."},
        {"question": "What are streams in Node.js and what types exist?", "ideal_answer": "Streams handle data in chunks rather than loading everything into memory. Types: Readable, Writable, Duplex (both), Transform (modify data). Used for file I/O, HTTP, and data processing."},
        {"question": "Explain the Node.js cluster module and worker threads.", "ideal_answer": "The cluster module forks multiple processes sharing the same port for load balancing. Worker threads provide true parallelism for CPU-intensive tasks within a single process. Choose based on I/O vs CPU needs."},
        {"question": "How do you secure a Node.js REST API?", "ideal_answer": "Use HTTPS, JWT/OAuth2 authentication, input validation, rate limiting, CORS configuration, helmet for security headers, parameterized queries to prevent injection, and dependency auditing."},
        {"question": "What is the difference between process.nextTick() and setImmediate()?", "ideal_answer": "process.nextTick() fires before any I/O events in the current phase, setImmediate() fires in the check phase after I/O. nextTick has higher priority and can starve the event loop if overused."},
        {"question": "How would you design a scalable Node.js microservice?", "ideal_answer": "Use stateless design, message queues (RabbitMQ/Kafka), containerization (Docker), service discovery, circuit breakers, health checks, centralized logging, and horizontal scaling."},
        {"question": "Describe a production Node.js issue you debugged.", "ideal_answer": "A strong answer covers the symptoms, debugging approach (memory profiling, CPU profiling, logging), root cause identification, fix implementation, and prevention measures."},
    ],
    "SQL": [
        {"question": "Explain the different types of SQL JOINs.", "ideal_answer": "INNER JOIN returns matching rows from both tables. LEFT JOIN returns all left rows plus matching right. RIGHT JOIN returns all right rows plus matching left. FULL OUTER JOIN returns all rows from both."},
        {"question": "What is the difference between WHERE and HAVING clauses?", "ideal_answer": "WHERE filters rows before grouping, HAVING filters groups after GROUP BY. WHERE cannot use aggregate functions, HAVING can. Example: HAVING COUNT(*) > 5."},
        {"question": "Explain database indexing and its types.", "ideal_answer": "Indexes are data structures that speed up data retrieval. Types: B-Tree (default), Hash (equality), GiST (geometric), GIN (full-text). Trade-offs: faster reads, slower writes, more storage."},
        {"question": "What are ACID properties in database transactions?", "ideal_answer": "Atomicity: all or nothing. Consistency: valid state transitions. Isolation: concurrent transactions don't interfere. Durability: committed changes persist. These ensure reliable database operations."},
        {"question": "Explain the difference between UNION and UNION ALL.", "ideal_answer": "UNION combines results and removes duplicates (slower, requires sorting). UNION ALL combines all results including duplicates (faster). Use UNION ALL when duplicates are acceptable for performance."},
        {"question": "What are window functions and give an example?", "ideal_answer": "Window functions perform calculations across a set of rows related to the current row. Examples: ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD(), SUM() OVER(PARTITION BY ...)."},
        {"question": "How do you optimize a slow SQL query?", "ideal_answer": "Analyze with EXPLAIN plan, add proper indexes, avoid SELECT *, reduce subqueries, use joins instead of correlated subqueries, optimize WHERE clauses, consider denormalization, and use query caching."},
        {"question": "Explain stored procedures vs functions in SQL.", "ideal_answer": "Stored procedures can modify data and don't need to return values. Functions must return a value and cannot modify data (in most RDBMS). Functions can be used in SELECT, procedures are called with EXECUTE."},
        {"question": "What is database sharding and when would you use it?", "ideal_answer": "Sharding horizontally partitions data across multiple databases. Use it when a single database can't handle the load. Strategies: range-based, hash-based, directory-based. Challenges: cross-shard queries, rebalancing."},
        {"question": "Describe a database performance issue you solved.", "ideal_answer": "A strong answer covers the symptoms, how they identified the bottleneck (slow queries, missing indexes, lock contention), the solution implemented, and the performance improvement achieved."},
    ],
    "DSA": [
        {"question": "Explain the difference between BFS and DFS.", "ideal_answer": "BFS explores level by level using a queue, finding shortest paths in unweighted graphs. DFS explores as deep as possible using a stack/recursion, useful for topological sort and cycle detection."},
        {"question": "What is dynamic programming and when should you use it?", "ideal_answer": "DP solves problems by breaking them into overlapping subproblems and storing solutions (memoization/tabulation). Use when a problem has optimal substructure and overlapping subproblems. Examples: Fibonacci, knapsack."},
        {"question": "Explain the time complexity of common sorting algorithms.", "ideal_answer": "Bubble/Selection/Insertion: O(n^2). Merge Sort: O(n log n) always. Quick Sort: O(n log n) average, O(n^2) worst. Heap Sort: O(n log n). Counting/Radix: O(nk). Tim Sort: O(n log n)."},
        {"question": "What is a hash table and how do you handle collisions?", "ideal_answer": "A hash table maps keys to values using a hash function. Collision handling: chaining (linked lists at each bucket), open addressing (linear probing, quadratic probing, double hashing)."},
        {"question": "Explain the difference between a stack and a queue.", "ideal_answer": "Stack follows LIFO (Last In First Out) - push/pop from top. Queue follows FIFO (First In First Out) - enqueue at rear, dequeue from front. Both have O(1) operations."},
        {"question": "What is a binary search tree and its time complexities?", "ideal_answer": "BST is a tree where left children are smaller and right children are larger. Average: O(log n) for search/insert/delete. Worst case (skewed): O(n). Self-balancing variants (AVL, Red-Black) guarantee O(log n)."},
        {"question": "Explain the concept of greedy algorithms with an example.", "ideal_answer": "Greedy algorithms make locally optimal choices at each step hoping for a global optimum. Examples: Dijkstra's algorithm, Huffman coding, activity selection. Not always optimal (vs DP)."},
        {"question": "What is the two-pointer technique and when do you use it?", "ideal_answer": "Two pointers traverse a sorted array/linked list from different positions. Use for pair sum problems, removing duplicates, palindrome checking, and container with most water. Usually O(n) time."},
        {"question": "Explain graph representations and their trade-offs.", "ideal_answer": "Adjacency matrix: O(V^2) space, O(1) edge lookup. Adjacency list: O(V+E) space, O(degree) edge lookup. Matrix for dense graphs, list for sparse. Edge list for edge-centric algorithms."},
        {"question": "Walk me through how you would solve a complex algorithmic problem.", "ideal_answer": "A strong answer describes: understand the problem, identify patterns, consider brute force first, optimize with appropriate data structures, analyze time/space complexity, test with edge cases."},
    ],
    "OOPs": [
        {"question": "Explain the four pillars of OOP.", "ideal_answer": "Encapsulation: bundling data and methods. Abstraction: hiding complexity. Inheritance: deriving classes from parent classes. Polymorphism: same interface, different implementations (overloading/overriding)."},
        {"question": "What is the difference between composition and inheritance?", "ideal_answer": "Inheritance creates 'is-a' relationships (tight coupling). Composition creates 'has-a' relationships (loose coupling). Favor composition over inheritance for flexibility and to avoid fragile base class problems."},
        {"question": "Explain method overloading vs method overriding.", "ideal_answer": "Overloading: same method name, different parameters in the same class (compile-time polymorphism). Overriding: same method signature in a subclass replaces parent's implementation (runtime polymorphism)."},
        {"question": "What are design patterns? Explain Singleton and Factory.", "ideal_answer": "Design patterns are reusable solutions to common problems. Singleton ensures one instance exists globally. Factory creates objects without specifying exact classes, enabling loose coupling."},
        {"question": "Explain the SOLID principles.", "ideal_answer": "S: Single Responsibility. O: Open/Closed (open for extension, closed for modification). L: Liskov Substitution. I: Interface Segregation. D: Dependency Inversion. They guide maintainable OO design."},
        {"question": "What is the difference between abstract classes and interfaces?", "ideal_answer": "Abstract classes can have implementations and state, support single inheritance. Interfaces define contracts with no state (traditionally), support multiple inheritance. Modern languages blur these distinctions."},
        {"question": "Explain encapsulation and access modifiers.", "ideal_answer": "Encapsulation bundles data with methods that operate on it, restricting direct access. Access modifiers: public (all), protected (class/subclass), private (class only). Getters/setters control access."},
        {"question": "What is polymorphism? Give runtime and compile-time examples.", "ideal_answer": "Compile-time: method overloading, operator overloading. Runtime: method overriding via virtual methods. Enables writing flexible code that works with base types while executing derived implementations."},
        {"question": "Explain the Observer design pattern.", "ideal_answer": "Observer defines a one-to-many dependency. When the subject changes state, all observers are notified. Used in event systems, MVC architecture, and reactive programming. Promotes loose coupling."},
        {"question": "How do you decide between using inheritance vs composition in a real project?", "ideal_answer": "Use inheritance for true 'is-a' relationships with shared behavior. Use composition for 'has-a' or 'uses-a' relationships. Prefer composition for flexibility, testability, and avoiding deep hierarchies."},
    ],
    "DBMS": [
        {"question": "Explain the different normal forms in database normalization.", "ideal_answer": "1NF: atomic values, no repeating groups. 2NF: 1NF + no partial dependencies. 3NF: 2NF + no transitive dependencies. BCNF: every determinant is a candidate key. Higher forms reduce redundancy."},
        {"question": "What is a transaction and explain ACID properties.", "ideal_answer": "A transaction is a logical unit of work. ACID: Atomicity (all or nothing), Consistency (valid states), Isolation (concurrent independence), Durability (permanent once committed)."},
        {"question": "Explain different types of database keys.", "ideal_answer": "Primary key: unique identifier. Foreign key: references another table's primary key. Candidate key: minimal superkey. Composite key: multiple columns. Surrogate key: system-generated identifier."},
        {"question": "What are the different isolation levels in databases?", "ideal_answer": "Read Uncommitted: dirty reads possible. Read Committed: no dirty reads. Repeatable Read: no non-repeatable reads. Serializable: full isolation. Higher levels mean more consistency but less concurrency."},
        {"question": "Explain the difference between SQL and NoSQL databases.", "ideal_answer": "SQL: structured, relational, ACID, fixed schema (PostgreSQL, MySQL). NoSQL: flexible schema, horizontal scaling, eventual consistency (MongoDB, Cassandra, Redis). Choose based on data model and scale needs."},
        {"question": "What is a deadlock and how do you prevent it?", "ideal_answer": "Deadlock occurs when two+ transactions wait for each other's locks. Prevention: consistent lock ordering, timeout-based detection, avoiding long transactions, using optimistic concurrency."},
        {"question": "Explain indexing strategies for database performance.", "ideal_answer": "B-tree for range queries, hash for equality, composite for multi-column queries, covering indexes to avoid table lookups, partial indexes for filtered data. Balance read speed vs write overhead."},
        {"question": "What is database replication and its types?", "ideal_answer": "Replication copies data across servers. Master-slave: writes to master, reads from slaves. Master-master: writes to any node. Synchronous vs asynchronous. Improves availability, read scaling, and disaster recovery."},
        {"question": "Explain query optimization techniques.", "ideal_answer": "Use EXPLAIN to analyze plans, proper indexing, avoid N+1 queries, use joins over subqueries, limit result sets, denormalize for read-heavy workloads, cache frequent queries, partition large tables."},
        {"question": "Describe a database design decision you made and its trade-offs.", "ideal_answer": "A strong answer covers the use case, schema design choices, normalization decisions, indexing strategy, performance considerations, and what they would do differently."},
    ],
    "Operating Systems": [
        {"question": "Explain the difference between process and thread.", "ideal_answer": "A process is an independent program with its own memory space. Threads share the process's memory and resources. Threads are lighter weight, faster to create/switch, but need synchronization for shared data."},
        {"question": "What is virtual memory and how does it work?", "ideal_answer": "Virtual memory abstracts physical RAM using page tables. Each process gets a virtual address space. Pages are swapped between RAM and disk as needed. Benefits: isolation, larger address space, memory protection."},
        {"question": "Explain different CPU scheduling algorithms.", "ideal_answer": "FCFS: simple, convoy effect. SJF: optimal avg wait, starvation. Round Robin: fair, time quantum matters. Priority: preemptive/non-preemptive. MLFQ: multiple queues with different priorities and algorithms."},
        {"question": "What is a deadlock? Explain the four necessary conditions.", "ideal_answer": "Deadlock: processes permanently blocked waiting for each other. Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait. All four must hold. Prevention removes at least one condition."},
        {"question": "Explain paging vs segmentation.", "ideal_answer": "Paging divides memory into fixed-size pages/frames, eliminating external fragmentation. Segmentation divides into variable-size logical segments. Paging is simpler, segmentation maps to program structure. Modern OS use both."},
        {"question": "What are semaphores and mutexes?", "ideal_answer": "Mutex: binary lock for mutual exclusion, owned by a thread. Semaphore: counting mechanism for resource management. Mutex is for mutual exclusion, semaphore for signaling and resource counting."},
        {"question": "Explain the difference between user mode and kernel mode.", "ideal_answer": "User mode: restricted access, runs application code. Kernel mode: full hardware access, runs OS code. System calls transition from user to kernel mode. This separation protects the system from buggy applications."},
        {"question": "What is thrashing and how do you prevent it?", "ideal_answer": "Thrashing occurs when excessive page faults cause the system to spend more time swapping than executing. Prevent by: working set model, limiting process count, adding RAM, optimizing memory usage."},
        {"question": "Explain inter-process communication (IPC) mechanisms.", "ideal_answer": "Pipes: unidirectional data flow. Message queues: structured messages. Shared memory: fastest, needs synchronization. Sockets: network communication. Signals: async notifications. Semaphores: synchronization."},
        {"question": "How does the OS handle a system call?", "ideal_answer": "A system call triggers a software interrupt, switching from user to kernel mode. The OS saves the process state, executes the requested service, returns the result, and switches back to user mode."},
    ],
    "Computer Networks": [
        {"question": "Explain the OSI model and its seven layers.", "ideal_answer": "Physical: bit transmission. Data Link: frame delivery, MAC. Network: routing, IP. Transport: end-to-end, TCP/UDP. Session: connection management. Presentation: data format. Application: user interface, HTTP/DNS."},
        {"question": "What is the difference between TCP and UDP?", "ideal_answer": "TCP: connection-oriented, reliable, ordered, flow control, slower (HTTP, FTP, email). UDP: connectionless, unreliable, unordered, faster (DNS, streaming, gaming). Choose based on reliability vs speed needs."},
        {"question": "Explain how DNS resolution works.", "ideal_answer": "Browser checks cache, then OS cache, then queries recursive resolver. Resolver queries root server, TLD server, then authoritative server. Result is cached at each level with TTL. Uses UDP port 53."},
        {"question": "What happens when you type a URL in the browser?", "ideal_answer": "DNS resolution, TCP handshake, TLS handshake (HTTPS), HTTP request, server processing, HTTP response, browser parsing (HTML/CSS/JS), DOM construction, rendering, and JavaScript execution."},
        {"question": "Explain the TCP three-way handshake.", "ideal_answer": "Client sends SYN with sequence number. Server responds with SYN-ACK. Client sends ACK. Connection established. This ensures both sides can send and receive, and synchronizes sequence numbers."},
        {"question": "What is a subnet and how does subnetting work?", "ideal_answer": "A subnet divides a network into smaller segments. Subnet mask determines network and host portions of an IP address. CIDR notation (e.g., /24) specifies the number of network bits. Improves security and routing."},
        {"question": "Explain HTTP/2 vs HTTP/1.1 vs HTTP/3.", "ideal_answer": "HTTP/1.1: text-based, one request per connection (with keep-alive). HTTP/2: binary, multiplexing, header compression, server push. HTTP/3: uses QUIC (UDP-based), faster handshakes, better on lossy networks."},
        {"question": "What is a load balancer and what algorithms does it use?", "ideal_answer": "Load balancer distributes traffic across servers. Algorithms: Round Robin, Least Connections, IP Hash, Weighted Round Robin. Types: L4 (transport) and L7 (application). Improves availability and performance."},
        {"question": "Explain the difference between symmetric and asymmetric encryption.", "ideal_answer": "Symmetric: same key for encrypt/decrypt (AES), faster, key distribution challenge. Asymmetric: public/private key pair (RSA), slower, solves distribution. TLS uses both: asymmetric for key exchange, symmetric for data."},
        {"question": "How would you troubleshoot a slow network connection?", "ideal_answer": "Check physical connections, use ping for latency, traceroute for path analysis, DNS resolution time, check bandwidth with speed tests, analyze packet captures with Wireshark, check for congestion or packet loss."},
    ],
    "System Design": [
        {"question": "Design a URL shortening service like bit.ly.", "ideal_answer": "Use a hash/counter for short codes, store mapping in a database with caching (Redis). Handle collisions, implement redirect (301/302), add analytics. Scale with sharding, CDN, and rate limiting."},
        {"question": "How would you design a real-time chat application?", "ideal_answer": "Use WebSockets for real-time communication, message queue (Kafka) for reliability, NoSQL for message storage, presence service, push notifications, end-to-end encryption. Scale with connection servers and sharding."},
        {"question": "Explain the concept of consistent hashing.", "ideal_answer": "Consistent hashing maps both servers and keys to a circular hash space. Adding/removing servers only affects nearby keys, minimizing redistribution. Virtual nodes improve balance. Used in distributed caches and databases."},
        {"question": "Design a rate limiter.", "ideal_answer": "Algorithms: Token Bucket (smooth), Leaky Bucket (fixed rate), Fixed Window Counter, Sliding Window Log, Sliding Window Counter. Use Redis for distributed rate limiting. Return 429 status code when exceeded."},
        {"question": "How would you design a notification system?", "ideal_answer": "Message queue for decoupling, template service, channel adapters (email, SMS, push), user preference service, delivery tracking, retry with exponential backoff, priority queues, and analytics."},
        {"question": "Explain CAP theorem and its implications for system design.", "ideal_answer": "CAP: Consistency, Availability, Partition tolerance - pick two during network partitions. CP systems (HBase): sacrifice availability. AP systems (Cassandra): sacrifice consistency. CA only without partitions."},
        {"question": "How would you design a distributed cache?", "ideal_answer": "Use consistent hashing for key distribution, cache-aside/read-through/write-through strategies, TTL for expiration, LRU eviction, replication for availability, and monitoring for hit rates."},
        {"question": "Design a social media news feed system.", "ideal_answer": "Fan-out on write (push) for users with few followers, fan-out on read (pull) for celebrities. Use Redis for feed cache, ranking algorithm, pagination with cursor, CDN for media, and anti-abuse measures."},
        {"question": "Explain horizontal vs vertical scaling and when to use each.", "ideal_answer": "Vertical: add resources to one machine (simple, has limits). Horizontal: add more machines (complex, unlimited). Start vertical, go horizontal when hitting limits. Horizontal needs load balancing, data partitioning."},
        {"question": "Walk me through designing a system you've built or would build.", "ideal_answer": "A strong answer covers requirements gathering, high-level architecture, component design, data model, API design, scaling strategy, failure handling, and monitoring. Shows systematic thinking."},
    ],
    "Full Stack": [
        {"question": "Explain the concept of Server-Side Rendering (SSR) vs. Client-Side Rendering (CSR).", "ideal_answer": "SSR renders the full HTML on the server and sends it to the browser, improving initial load speed and SEO. CSR loads a minimal HTML shell and leverages JavaScript to build the DOM in the browser, providing rich transitions but slower initial loads."},
        {"question": "How do you handle user authentication and session management in full stack apps?", "ideal_answer": "Typically managed using stateless JWT tokens stored in HTTP-only cookies or localStorage, or via stateful sessions stored in redis database databases. JWTs are verified using a server secret on each request."}
    ],
    "Data Science": [
        {"question": "What is the difference between supervised and unsupervised learning?", "ideal_answer": "Supervised learning trains models on labeled input-output pairs to predict target values (e.g. classification, regression). Unsupervised learning uncovers patterns or structures from unlabeled dataset inputs (e.g. clustering, dimensionality reduction)."},
        {"question": "Explain the concept of overfitting and how to prevent it.", "ideal_answer": "Overfitting happens when a model fits training data too closely, capturing noise and failing to generalize to new datasets. Prevent by using cross-validation, regularization (L1/L2), pruning decision trees, or getting more training data."}
    ],
    "Machine Learning": [
        {"question": "How does gradient descent optimize parameters in neural networks?", "ideal_answer": "Gradient descent is an optimization algorithm that iteratively updates model parameters (weights and biases) in the direction of steepest descent of the loss function (negative gradient) to find a global or local minimum."},
        {"question": "What is the role of activation functions, and why is ReLU preferred over sigmoid?", "ideal_answer": "Activation functions introduce non-linearity, enabling networks to learn complex decision boundaries. ReLU is preferred over sigmoid because it does not saturate for positive values, alleviating the vanishing gradient problem and accelerating learning."}
    ],
    "DevOps": [
        {"question": "What is Continuous Integration and Continuous Deployment (CI/CD) and why is it important?", "ideal_answer": "CI/CD automates integration, build, test, and release processes. Developers push code to a shared repository (CI), which is automatically verified, built, and deployed to staging or production (CD), reducing human errors and accelerating time-to-market."},
        {"question": "Explain the difference between mutable and immutable infrastructure.", "ideal_answer": "Mutable infrastructure involves updating software and configurations directly on active servers over time (leads to drift). Immutable infrastructure builds replacement server images (e.g. via Docker, Packer) and rolls out clean instances, ensuring consistency and reproducibility."}
    ],
    "Cloud": [
        {"question": "What is serverless computing, and what are its trade-offs?", "ideal_answer": "Serverless (e.g. AWS Lambda) runs code in ephemeral, managed containers without requiring server provisioning. Pros include automatic scaling, high availability, and pay-per-execution billing. Cons include cold starts, execution time limits, and vendor lock-in."},
        {"question": "Describe the difference between IaaS, PaaS, and SaaS cloud models.", "ideal_answer": "IaaS provides raw infrastructure (VMs, storage, network like AWS EC2). PaaS provides environments for coding and deployment without VM management (like Heroku, Elastic Beanstalk). SaaS delivers end-user applications hosted in the cloud (like Google Workspace, Salesforce)."}
    ],
    "Cyber Security": [
        {"question": "Explain SQL Injection and how to prevent it in application code.", "ideal_answer": "SQL injection occurs when unvalidated user input is concatenated directly into SQL query strings, allowing attackers to execute arbitrary SQL commands. Prevent by using parameterized queries (prepared statements), ORM tools, and input sanitization."},
        {"question": "What is the difference between encryption, hashing, and encoding?", "ideal_answer": "Encryption transforms plaintext into ciphertext using a key, designed to be decrypted. Hashing creates a one-way, fixed-length fingerprint of data, used for integrity and passwords. Encoding formats data for safe transmission (e.g., Base64), and is not cryptographic."}
    ],
    "Aptitude": [
        {"question": "A train covers a distance of 360 km at a uniform speed. If the speed had been 5 km/h more, it would have taken 1 hour less for the same journey. Find the speed of the train.", "ideal_answer": "Let speed be x. 360/x - 360/(x+5) = 1. Solving x(x+5) = 1800, we get x^2 + 5x - 1800 = 0 -> (x+45)(x-40) = 0. Speed of the train is 40 km/h."},
        {"question": "A sum of money doubles itself at simple interest in 10 years. In how many years will it triple itself?", "ideal_answer": "Let Principal be P. Interest = Principal. S.I. = P * R * 10 / 100 -> R = 10%. To triple itself, Interest must be 2P. 2P = P * 10 * T / 100 -> T = 20 years."}
    ],
    "HR Interview": [
        {"question": "Tell me about a time you faced a conflict in a team. How did you resolve it?", "ideal_answer": "A strong answer uses the STAR method: describe the situation, the task/challenge, the actions taken (active listening, empathy, compromising, transparent communication), and the positive outcome/learnings."},
        {"question": "Why do you want to join our company, and where do you see yourself in 5 years?", "ideal_answer": "A strong answer aligns personal values and career aspirations with the company's mission and culture. It outlines a desire for continuous learning, contributing to key projects, and growing into a senior technical or leadership role."}
    ]
}

# Generic fallback when domain doesn't match
MOCK_QUESTIONS = {
    "easy": DOMAIN_QUESTIONS["Python"][:3],
    "medium": DOMAIN_QUESTIONS["Python"][3:6],
    "hard": DOMAIN_QUESTIONS["Python"][6:9],
}

MOCK_EVALUATIONS = {
    "good": {"score": 8.5, "strengths": ["Clear explanation", "Good examples provided"], "weaknesses": ["Could add more depth"], "suggestions": ["Consider edge cases"], "ideal_answer": "Your answer was quite comprehensive. Consider adding more specific examples."},
    "average": {"score": 6.5, "strengths": ["Basic understanding shown"], "weaknesses": ["Missing important details", "Lacks depth"], "suggestions": ["Study more on this topic"], "ideal_answer": "A better answer would include more technical details and real-world examples."},
    "poor": {"score": 4.0, "strengths": ["Attempted to answer"], "weaknesses": ["Incorrect information", "Incomplete explanation"], "suggestions": ["Review fundamental concepts"], "ideal_answer": "Please review the basics of this concept and try again."}
}


def _get_domain_fallback(domain: str, count: int) -> List[dict]:
    """Get domain-specific fallback questions, handling count properly."""
    # Try exact domain match first
    pool = DOMAIN_QUESTIONS.get(domain, [])
    if not pool:
        # Try case-insensitive match
        for key in DOMAIN_QUESTIONS:
            if key.lower() == domain.lower():
                pool = DOMAIN_QUESTIONS[key]
                break
    if not pool:
        # Fall back to generic Python questions
        pool = DOMAIN_QUESTIONS.get("Python", [])
    
    # Build the result list with proper count
    result = []
    for q in pool:
        result.append({
            "question": q["question"],
            "answer": q.get("ideal_answer") or q.get("answer", ""),
        })
    
    # If we need more than available, cycle through
    if count > len(result) and result:
        extra_needed = count - len(result)
        idx = 0
        while extra_needed > 0:
            result.append(result[idx % len(pool)].copy())
            idx += 1
            extra_needed -= 1
    
    return result[:count]


def generate_questions(domain: str, difficulty: str, count: int = 5) -> List[dict]:
    """Generate interview questions for a given domain and difficulty level."""
    fallback_list = _get_domain_fallback(domain, count)

    if not GEMINI_AVAILABLE:
        logger.warning(f"Gemini not available, using domain-specific fallback for {domain} ({difficulty})")
        return fallback_list
    
    try:
        prompt = (
            f"Generate exactly {count} interview questions for a {difficulty} level candidate in {domain}. "
            "Ensure you include a mix of technical questions, behavioral questions, and follow-up style questions. "
            "Return the output STRICTLY as a JSON array of objects, with NO markdown formatting, NO backticks. "
            "Each object must have the exact keys 'question' and 'ideal_answer'."
        )
        content = call_gemini(prompt)
        content = content.replace("```json", "").replace("```", "").strip()
        try:
            items = json.loads(content)
            if isinstance(items, dict):
                items = [items]
        except Exception:
            try:
                items = ast.literal_eval(content)
                if isinstance(items, dict):
                    items = [items]
            except Exception:
                items = []
        
        results = []
        for item in items:
            if "question" in item and "ideal_answer" in item:
                results.append({
                    "question": item["question"],
                    "answer": item["ideal_answer"],
                })
        return results or fallback_list
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        return fallback_list


def generate_dynamic_interview_questions(payload: dict) -> List[dict]:
    """Generate dynamic interview questions based on user skills, resume, target company, and job role."""
    if not GEMINI_AVAILABLE:
        logger.warning(f"Gemini not available, returning generic fallback for dynamic generation.")
        return _get_domain_fallback(payload.get("domain", "General"), 5)
    
    try:
        skills = payload.get("skills", "general programming")
        resume = payload.get("resume_content", "")
        company = payload.get("target_company", "a tech company")
        role = payload.get("job_role", "Software Engineer")
        count = payload.get("count", 5)
        difficulty = payload.get("difficulty", "Medium")

        prompt = (
            f"Act as an expert technical interviewer at {company} hiring for the {role} position. "
            f"The candidate has the following skills: {skills}. "
            f"Resume context: {resume[:500]}... "
            f"Generate exactly {count} interview questions for a {difficulty} level candidate. "
            "Return the output STRICTLY as a JSON array of objects, with NO markdown formatting, NO backticks. "
            "Each object must have the exact keys 'question', 'expected_answer', 'subtopic', and 'keywords' (array of strings)."
        )
        content = call_gemini(prompt)
        content = content.replace("```json", "").replace("```", "").strip()
        try:
            items = json.loads(content)
            if isinstance(items, dict):
                items = [items]
        except Exception:
            items = []
        
        results = []
        for item in items:
            if "question" in item and "expected_answer" in item:
                results.append({
                    "question": item["question"],
                    "expected_answer": item["expected_answer"],
                    "subtopic": item.get("subtopic", "General"),
                    "keywords": item.get("keywords", []),
                })
        return results
    except Exception as e:
        logger.error(f"Error generating dynamic questions: {str(e)}")
        return _get_domain_fallback(payload.get("domain", "General"), 5)



def _heuristic_evaluate(question: str, answer: str, domain: str) -> dict:
    """Heuristic evaluation when Gemini is unavailable. Uses keyword overlap with ideal answers."""
    import re
    
    answer_words = set(re.findall(r'\w+', answer.lower()))
    answer_length = len(answer.split())
    
    # Find the ideal answer for this question from our question bank
    ideal_answer = ""
    for dq_list in DOMAIN_QUESTIONS.values():
        for dq in dq_list:
            if dq["question"].lower().strip().rstrip('.') in question.lower() or question.lower().strip().rstrip('.') in dq["question"].lower():
                ideal_answer = dq.get("ideal_answer", "")
                break
        if ideal_answer:
            break
    
    ideal_words = set(re.findall(r'\w+', ideal_answer.lower())) if ideal_answer else set()
    # Remove common stop words
    stop_words = {'the','a','an','is','are','was','were','be','been','and','or','but','in','on','at','to','for','of','with','by','it','its','this','that','from','as','can','has','have','had','not','no','do','does','did','will','would','could','should','may','might','shall','about','also','into','over','after','such','more','than','only','just','very','so','too','much','how','what','when','where','which','who','why','each','all','any','some','other','most','if','then','else'}
    
    answer_keywords = answer_words - stop_words
    ideal_keywords = ideal_words - stop_words
    
    # Calculate keyword overlap score
    if ideal_keywords:
        overlap = len(answer_keywords & ideal_keywords)
        overlap_ratio = overlap / len(ideal_keywords)
    else:
        overlap_ratio = 0.3  # neutral if no ideal answer found
    
    # Composite scoring: 40% length, 40% keyword overlap, 20% structure
    length_score = min(10, answer_length / 5)  # 50 words = 10
    overlap_score = overlap_ratio * 10
    structure_bonus = 0
    if any(w in answer.lower() for w in ['example', 'instance', 'such as', 'e.g.', 'for example']):
        structure_bonus += 1.5
    if any(w in answer.lower() for w in ['because', 'therefore', 'thus', 'since', 'due to']):
        structure_bonus += 1.0
    if len(answer) > 200:
        structure_bonus += 0.5
    
    raw_score = (length_score * 0.4) + (overlap_score * 0.4) + min(3, structure_bonus)
    final_score = round(min(9.5, max(2.0, raw_score)), 1)
    
    # Generate contextual feedback
    strengths = []
    weaknesses = []
    suggestions = []
    
    if final_score >= 7:
        strengths.append("Demonstrates solid understanding of the topic")
        if overlap_ratio > 0.5:
            strengths.append("Covers key concepts accurately")
        if answer_length > 40:
            strengths.append("Provides detailed explanation")
        weaknesses.append("Could include more real-world examples")
        suggestions.append("Consider discussing edge cases and trade-offs")
    elif final_score >= 5:
        strengths.append("Shows basic understanding of core concepts")
        weaknesses.append("Missing important technical details")
        weaknesses.append("Explanation lacks depth in key areas")
        suggestions.append("Study the fundamentals more thoroughly")
        suggestions.append("Practice explaining concepts with specific examples")
    else:
        strengths.append("Attempted to address the question")
        weaknesses.append("Response is too brief or lacks technical accuracy")
        weaknesses.append("Key concepts are missing from the answer")
        suggestions.append("Review the core concepts for this topic")
        suggestions.append("Practice writing structured, detailed answers")
        suggestions.append("Use the STAR method for behavioral questions")
    
    return {
        "score": final_score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions,
        "ideal_answer": ideal_answer or "A comprehensive answer should cover the key concepts, provide examples, and discuss trade-offs."
    }


def evaluate_answer(question: str, answer: str, domain: str) -> dict:
    """Evaluate a user's answer to an interview question."""
    if not GEMINI_AVAILABLE:
        logger.warning("Gemini not available, using heuristic evaluation")
        return _heuristic_evaluate(question, answer, domain)
    
    try:
        prompt = (
            f"Evaluate the user's answer for the interview question in {domain}.\n"
            f"Question: {question}\n"
            f"Answer: {answer}\n"
            "Rate the answer out of 10 and provide strengths, weaknesses, suggestions, and an ideal answer. "
            "Return STRICTLY valid JSON with NO markdown formatting. Keys must be: score, strengths, weaknesses, suggestions, ideal_answer."
        )
        content = call_gemini(prompt)
        content = content.replace("```json", "").replace("```", "").strip()
        try:
            parsed = json.loads(content)
        except Exception:
            try:
                parsed = ast.literal_eval(content)
            except Exception:
                parsed = {"score": 6, "strengths": ["Clear structure"], "weaknesses": ["Missing depth"], "suggestions": ["Add more details"], "ideal_answer": "A strong response should cover..."}
        return parsed
    except Exception as e:
        logger.error(f"Error evaluating answer: {str(e)}")
        return _heuristic_evaluate(question, answer, domain)


def generate_company_questions(company: str, domain: str, difficulty: str, count: int = 5) -> List[dict]:
    """Generate company-specific interview questions."""
    if not GEMINI_AVAILABLE:
        logger.warning(f"Gemini not available, using mock data for {company}")
        return generate_questions(domain, difficulty, count)
    
    try:
        prompt = (
            f"Generate exactly {count} {difficulty} interview questions for {company} in the domain of {domain}. "
            "Include the question and a concise ideal answer. "
            "Return the output STRICTLY as a JSON array with no markdown. Each object must have keys 'question' and 'ideal_answer'."
        )
        content = call_gemini(prompt)
        content = content.replace("```json", "").replace("```", "").strip()
        try:
            items = json.loads(content)
            if isinstance(items, dict):
                items = [items]
        except Exception:
            try:
                items = ast.literal_eval(content)
                if isinstance(items, dict):
                    items = [items]
            except Exception:
                items = []
        
        results = []
        for item in items:
            if "question" in item and "ideal_answer" in item:
                results.append({"question": item["question"], "answer": item["ideal_answer"]})
        return results or generate_questions(domain, difficulty, count)
    except Exception as e:
        logger.error(f"Error generating company questions: {str(e)}")
        return generate_questions(domain, difficulty, count)


def _get_fallback_study_plan(domain: str, current_level: str, target_role: str, weak_topics: List[str] = None, daily_study_hours: int = 2, target_company: str = None) -> dict:
    weeks_data = []
    
    # Generic milestones for the 8 weeks
    milestones = [
        "Language Syntax & Fundamentals Review",
        "Object Oriented Design & Structural Patterns",
        "Data Structures & Core Algorithms",
        "Advanced Concepts & Concurrency Model",
        "Web Architecture & Framework Implementation",
        "Database Design & Query Performance",
        "System Design & Cloud Scale Planning",
        "Mock Interview Scenarios & Final Assessment"
    ]
    
    # Domain-specific topic lists
    DOMAIN_TOPICS = {
        "python": [
            ["Python Syntax", "Data Types", "Variables", "Control Flow"],
            ["Lists", "Tuples", "Dicts", "Comprehensions", "Iterators"],
            ["OOP", "Classes", "Inheritance", "Decorators", "Metaclasses"],
            ["Multithreading", "GIL", "AsyncIO", "Multiprocessing"],
            ["FastAPI", "Django", "REST APIs", "Authentication"],
            ["SQLAlchemy", "ORM", "Database Joins", "Query Optimization"],
            ["Redis Caching", "Docker", "CI/CD", "Deployment"],
            ["Mock Interviews", "Behavioral Questions", "System Design Basics"]
        ],
        "java": [
            ["Java Basics", "JVM", "Access Modifiers", "Memory Model"],
            ["OOP", "Interfaces", "Abstract Classes", "Generics"],
            ["Collections", "HashMap", "ArrayList", "Iterators"],
            ["Multithreading", "Volatile", "ExecutorService", "Locks"],
            ["Spring Boot", "Dependency Injection", "MVC Pattern"],
            ["Spring Data JPA", "Hibernate", "Transactions"],
            ["Microservices", "REST", "gRPC", "Message Queues"],
            ["Mock Tests", "Java Interview Patterns", "Algorithms"]
        ],
        "javascript": [
            ["ES6+", "Arrow Functions", "Destructuring", "Template Literals"],
            ["Async/Await", "Promises", "Event Loop", "Closures"],
            ["DOM", "Events", "Web APIs", "Browser Storage"],
            ["React Basics", "Components", "Props", "State", "Hooks"],
            ["Redux", "Zustand", "React Router", "Code Splitting"],
            ["Node.js", "Express", "Middleware", "JWT Auth"],
            ["MongoDB", "PostgreSQL", "REST APIs", "GraphQL"],
            ["System Design", "Performance", "Testing", "Mock Interviews"]
        ],
    }
    
    # Customize milestones if domain matches specific known stacks
    if "python" in domain.lower():
        milestones = [
            "Python Syntax, Datatypes & Memory Management",
            "Advanced Control Flow, Iterators & Generators",
            "Decorators, Metaclasses & OOP in Python",
            "Python Multithreading, GIL & AsyncIO Concurrency",
            "FastAPI/Django Framework & REST API Integration",
            "SQLAlchemy ORM, Database Joins & Performance Tuning",
            "Caching with Redis & Deploying Python Applications",
            "Final Mock Interviews & Behavioral Prep"
        ]
        topic_key = "python"
    elif "java" in domain.lower():
        milestones = [
            "Java Basics, Access Modifiers & JVM Memory model",
            "OOP in Java, Interfaces & Abstract Classes",
            "Java Collections Framework & Custom Structures",
            "Multithreading, Volatile & ExecutorService",
            "Spring Boot Core, Dependency Injection & MVC",
            "Spring Data JPA, Hibernate & Transaction Management",
            "Microservices Architecture & System Design",
            "Review Java Interview Logs & Mock Tests"
        ]
        topic_key = "java"
    elif any(x in domain.lower() for x in ["javascript", "js", "stack", "react", "node"]):
        milestones = [
            "ES6+ Features, Closures & Execution Context",
            "Asynchronous JavaScript, Promises & Event Loop",
            "DOM Manipulation & Dynamic Event Handling",
            "React.js Core Concepts, Hooks & Context API",
            "React State Management (Redux/Zustand) & Routing",
            "Node.js Backend, Express Middlewares & JWT Auth",
            "MongoDB/PostgreSQL Integration & API Deployment",
            "System Architecture, Caching & Front-to-Back Mock Assessments"
        ]
        topic_key = "javascript"
    elif any(x in domain.lower() for x in ["data", "ml", "ai"]):
        milestones = [
            "Probability, Statistics & Linear Algebra Basics",
            "SQL Queries, Aggregations & Data Import/Export",
            "Data Analysis & Visualization (Pandas, NumPy, Seaborn)",
            "Classical Machine Learning (Regression, Trees, Clustering)",
            "Neural Network Architectures & Deep Learning Core",
            "NLP, Transformers & Fine-Tuning LLM Models",
            "MLOps, Model Packaging & API Deployment",
            "Final Project Review & Theoretical ML Interview Prep"
        ]
        topic_key = None
    else:
        topic_key = None
        
    for i in range(1, 9):
        goal = milestones[i-1]
        
        # Get topics for this week
        if topic_key and topic_key in DOMAIN_TOPICS:
            week_topics = DOMAIN_TOPICS[topic_key][i-1] if i <= len(DOMAIN_TOPICS[topic_key]) else [goal]
        else:
            week_topics = [goal, "Problem Solving", "Code Review"]
        
        daily_tasks = [
            f"Monday: Study theoretical foundation of '{goal}' — read docs and take notes ({daily_study_hours}h).",
            f"Tuesday: Watch tutorial videos and implement small examples ({max(1, daily_study_hours-1)}h).",
            f"Wednesday: Complete hands-on coding exercises and LeetCode problems ({daily_study_hours}h).",
            f"Thursday: Build a mini project or feature applying this week's concepts ({daily_study_hours}h).",
            f"Friday: Review notes, quiz yourself, and fix any gaps ({max(1, daily_study_hours-1)}h).",
            f"Saturday: Peer review or solve a coding challenge from a competition platform.",
            f"Sunday: Rest and light revision — re-read summaries and flashcards."
        ]
        
        weeks_data.append({
            "week": i,
            "goal": goal,
            "topics": week_topics,
            "daily_tasks": daily_tasks,
            "practice": f"Solve 5 problems on LeetCode/HackerRank covering: {', '.join(week_topics[:2])}.",
            "project": f"Build a mini {domain} project that demonstrates understanding of {goal}.",
            "assignment": f"Write a technical summary or blog post explaining what you learned this week about {goal}.",
            "mock_interview": f"Practice 2 mock interview Q&As focused on {goal}. Ask a peer or use the AI Mock Interview module.",
            "revision": f"Review Weeks {max(1, i-1)}-{i} notes. Update your flashcards and fix any knowledge gaps.",
            "aptitude": "Solve 5 quantitative reasoning problems (number series, percentages, time & work).",
            "coding_challenge": f"Complete 1 medium {domain} coding challenge on Codeforces, AtCoder, or LeetCode."
        })
        
    company_suffix = f" at {target_company}" if target_company else ""
    num_weeks = 8
    
    return {
        "headline": f"{num_weeks}-Week {current_level} Study Plan for {target_role}{company_suffix} ({domain})",
        "summary": f"A structured {num_weeks}-week roadmap tailored for a {current_level} learner targeting a {target_role} role in {domain}. Each week includes daily tasks, hands-on projects, mock interviews, and curated resources.",
        "weekly_plan": weeks_data,
        "learning_resources": {
            "documentation": [
                f"Official {domain} Documentation — https://docs.python.org" if "python" in domain.lower() else f"Official {domain} Documentation",
                "MDN Web Docs — https://developer.mozilla.org",
                "DevDocs.io — All-in-one documentation browser"
            ],
            "youtube": [
                "Traversy Media — Practical project-based tutorials",
                "Fireship — Fast-paced modern web dev content",
                f"Tech With Tim — {domain} tutorials and projects",
                "NetworkChuck — Networking and cloud fundamentals"
            ],
            "articles": [
                "dev.to — Community-driven technical articles",
                "Medium Engineering blogs — In-depth technical writing",
                "Hackernoon — Software engineering insights",
                "freeCodeCamp Blog — Tutorials and how-to guides"
            ],
            "github": [
                "kamranahmedse/developer-roadmap — Full career roadmaps",
                "jwasham/coding-interview-university — Interview prep repository",
                "donnemartin/system-design-primer — System design guide",
                f"vinta/awesome-{domain.lower().replace(' ','-')} — Curated {domain} resources"
            ],
            "platforms": [
                "LeetCode — Daily coding challenges and interview prep",
                "HackerRank — Domain-specific skill tracks",
                "Coursera / Udemy — Structured video courses",
                "Codeforces — Competitive programming contests",
                "Kaggle — Data science competitions and datasets"
            ]
        },
        "milestones": {
            "1_month": f"Complete Weeks 1-4. Solid grasp of {domain} fundamentals and 2 mini-projects built.",
            "3_months": f"Complete Weeks 1-8. Portfolio ready with 2 projects, 50+ LeetCode problems solved.",
            "6_months": "Advanced topics mastered, 150+ DSA problems solved, mock interviews scoring 7+/10.",
            "completion": f"Placement-ready {target_role}. Full portfolio, certifications, and confident in interviews."
        },
        "projects": [
            {
                "title": f"Scalable {domain} Web Service",
                "description": f"Build a multi-tier API implementing the core {domain} concepts learned throughout Weeks 1-5. Add authentication, database integration, and deploy to a cloud provider."
            },
            {
                "title": "Production Deployment Pipeline",
                "description": "Containerize the application using Docker, configure a CI/CD pipeline with GitHub Actions, and deploy with health monitoring and logging."
            }
        ],
        "interview_preparation_roadmap": "1. Solidify syntax/DSA (Weeks 1-3). 2. Construct projects & review architecture (Weeks 4-6). 3. Conduct speech/mock interview simulations (Weeks 7-8)."
    }



def _get_fallback_career_roadmap(domain: str, current_level: str, target_role: str) -> dict:
    required_skills = [domain, "Data Structures & Algorithms", "System Design", "Cloud Computing"]
    if "python" in domain.lower():
        required_skills.extend(["FastAPI", "Django", "Pytest", "AsyncIO"])
    elif "java" in domain.lower():
        required_skills.extend(["Spring Boot", "Hibernate", "JVM Internals", "Microservices"])
    elif any(x in domain.lower() for x in ["javascript", "js", "stack"]):
        required_skills.extend(["React.js", "Node.js", "TypeScript", "Express"])
    elif any(x in domain.lower() for x in ["data", "ml", "ai"]):
        required_skills.extend(["Pandas", "PyTorch", "Transformers", "MLOps"])
        
    missing_skills = [s for s in required_skills if s.lower() != domain.lower()][:3]
    
    roadmap_phases = [
        f"Phase 1: Transition from {current_level} to specialized role capability by mastering {required_skills[0]}.",
        f"Phase 2: Construct 2 production-grade projects featuring {required_skills[1]}.",
        f"Phase 3: Clear premium certifications and practice 20+ mock technical interviews."
    ]
    
    salary_insights = {
        "entry": "$95,000 - $120,000",
        "mid": "$130,000 - $160,000",
        "senior": "$170,000 - $240,000"
    }
    
    return {
        "headline": f"AI Career Roadmap: Path to {target_role} ({domain})",
        "career_path": f"{current_level} Developer -> Senior {target_role} -> Lead Architect",
        "required_skills": required_skills,
        "missing_skills": missing_skills,
        "learning_resources": [
            f"Advanced {domain} Masterclasses",
            "Designing Data-Intensive Applications by Martin Kleppmann",
            "Kaggle & Open-source repository collaborations"
        ],
        "certifications": [
            f"Certified {domain} Expert / Developer Professional",
            "AWS Certified Solutions Architect - Associate",
            "Google Cloud Professional Cloud Architect"
        ],
        "projects": [
            {
                "title": "Enterprise Microservice Infrastructure",
                "description": f"Build a resilient database-backed API in {domain} using message queuing and load balancing."
            }
        ],
        "interview_preparation": "Focus on high-level architecture designs, concurrency principles, and standard coding patterns.",
        "job_roles": [
            f"Senior {target_role}",
            f"{domain} Solutions Architect",
            "Core Infrastructure Engineer"
        ],
        "salary_insights": salary_insights,
        "growth_roadmap": roadmap_phases
    }


def generate_study_plan(domain: str, current_level: str, target_role: str = "Interview readiness",
                        weak_topics: List[str] = None, daily_study_hours: int = 2,
                        target_company: str = None, plan_duration: str = "8") -> dict:
    """Generate a comprehensive personalized study plan (8/12/24 weeks) with full detail."""
    fallback_plan = _get_fallback_study_plan(domain, current_level, target_role, weak_topics, daily_study_hours, target_company)
    
    if not GEMINI_AVAILABLE or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
        return fallback_plan
    
    try:
        weaknesses = ", ".join(weak_topics or [])
        num_weeks = int(plan_duration) if str(plan_duration).isdigit() else 8
        company_ctx = target_company or "any top tech company"
        
        prompt = (
            f"Create a comprehensive {num_weeks}-week study plan for a {current_level} student targeting the {target_role} role in {domain}.\n"
            f"Daily study hours: {daily_study_hours}. Target company: {company_ctx}.\n"
            f"Weak areas to improve: {weaknesses or 'general'}.\n"
            "Return STRICTLY valid JSON only (no markdown, no backticks) with this EXACT structure:\n"
            "{\n"
            '  "headline": "[N]-Week Study Plan for [Role] at [Company]",\n'
            '  "summary": "Brief 2-sentence overview of this plan",\n'
            '  "weekly_plan": [\n'
            '    {\n'
            '      "week": 1,\n'
            '      "goal": "Clear milestone goal for this week",\n'
            '      "topics": ["Topic 1", "Topic 2"],\n'
            '      "daily_tasks": ["Mon: Task", "Tue: Task", "Wed: Task", "Thu: Task", "Fri: Task"],\n'
            '      "practice": "Solve 10 problems on LeetCode/HackerRank covering this week\'s topic",\n'
            '      "project": "Build a mini project applying week\'s concepts",\n'
            '      "assignment": "Write a technical blog or summary of what you learned",\n'
            '      "mock_interview": "Practice 2 mock Q&As on this topic",\n'
            '      "revision": "Review last week\'s notes and flashcards",\n'
            '      "aptitude": "Solve 5 quantitative/logical reasoning problems",\n'
            '      "coding_challenge": "Complete 1 medium-difficulty coding challenge"\n'
            '    }\n'
            '  ],\n'
            '  "learning_resources": {\n'
            '    "documentation": ["Official Docs 1", "Official Docs 2"],\n'
            '    "youtube": ["YouTube Channel/Playlist 1", "YouTube Channel/Playlist 2"],\n'
            '    "articles": ["Article/Blog 1", "Article/Blog 2"],\n'
            '    "github": ["GitHub Repo 1", "GitHub Repo 2"],\n'
            '    "platforms": ["LeetCode", "HackerRank", "Coursera"]\n'
            '  },\n'
            '  "milestones": {\n'
            '    "1_month": "Goal by end of month 1",\n'
            '    "3_months": "Goal by end of month 3",\n'
            '    "6_months": "Goal by end of month 6",\n'
            '    "completion": "Final readiness goal"\n'
            '  }\n'
            "}"
        )
        content = call_gemini(prompt)
        content = content.replace("```json", "").replace("```", "").strip()
        try:
            parsed = json.loads(content)
            if "headline" in parsed and "weekly_plan" in parsed:
                return parsed
        except Exception:
            try:
                parsed = ast.literal_eval(content)
                if "headline" in parsed and "weekly_plan" in parsed:
                    return parsed
            except Exception:
                pass
        return fallback_plan
    except Exception as e:
        logger.error(f"Error generating study plan: {str(e)}")
        return fallback_plan


def generate_career_roadmap(domain: str, current_level: str, target_role: str, years_experience: str = "1-2", target_company: str = None) -> dict:
    """Generate a comprehensive AI career roadmap with phases, skills, resources and interview tips."""
    # Build a rich fallback that also uses the new field names expected by the frontend
    base_fallback = _get_fallback_career_roadmap(domain, current_level, target_role)
    # Map old field names to new frontend-expected field names
    fallback_roadmap = {
        "headline": base_fallback.get("headline", f"Career Roadmap: {target_role}"),
        "summary": f"A structured career roadmap for transitioning from {current_level} to {target_role} in {domain}.",
        "weekly_plan": base_fallback.get("growth_roadmap", []),
        "skills_to_develop": base_fallback.get("required_skills", []),
        "learning_resources": base_fallback.get("learning_resources", []),
        "projects": [p["title"] + ": " + p["description"] if isinstance(p, dict) else str(p) for p in base_fallback.get("projects", [])],
        "interview_tips": [
            "Study system design fundamentals and common architectural patterns.",
            "Practice behavioral questions using the STAR method.",
            "Complete at least 50 LeetCode problems (easy to medium) before interviews.",
            "Review company-specific interview formats and question banks."
        ],
        "estimated_timeline": f"6-12 months to transition from {current_level} to {target_role}"
    }
    
    if not GEMINI_AVAILABLE or GEMINI_API_KEY == "YOUR_GEMINI_API_KEY":
        return fallback_roadmap
        
    try:
        company_context = f" targeting {target_company}" if target_company else ""
        prompt = (
            f"Create a detailed career roadmap for a {current_level} candidate with {years_experience} years experience"
            f" aiming to become a {target_role} in the {domain} domain{company_context}.\n"
            "Return STRICTLY valid JSON (no markdown formatting, no backticks, no code blocks) with this EXACT structure:\n"
            "{\n"
            '  "headline": "Personalized Career Roadmap: Path to [Role]",\n'
            '  "summary": "2-3 sentence overview of the career transition plan",\n'
            '  "weekly_plan": ["Phase 1: description", "Phase 2: description", "Phase 3: description", "Phase 4: description"],\n'
            '  "skills_to_develop": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],\n'
            '  "learning_resources": ["Resource 1", "Resource 2", "Resource 3", "Resource 4"],\n'
            '  "projects": ["Project 1: description", "Project 2: description", "Project 3: description"],\n'
            '  "interview_tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"],\n'
            '  "estimated_timeline": "e.g. 6-9 months to reach target role"\n'
            "}"
        )
        content = call_gemini(prompt)
        content = content.replace("```json", "").replace("```", "").strip()
        try:
            parsed = json.loads(content)
            if "headline" in parsed and "weekly_plan" in parsed:
                return parsed
        except Exception:
            try:
                parsed = ast.literal_eval(content)
                if "headline" in parsed and "weekly_plan" in parsed:
                    return parsed
            except Exception:
                pass
        return fallback_roadmap
    except Exception as e:
        logger.error(f"Error generating career roadmap: {str(e)}")
        return fallback_roadmap


def generate_coding_challenge(domain: str, difficulty: str) -> dict:
    """Generate a coding challenge."""
    if not GEMINI_AVAILABLE:
        logger.warning("Gemini not available, using mock coding challenge")
        return {
            "prompt": f"Implement a solution for a {difficulty} level {domain} problem.",
            "sample_input": "[1, 2, 3, 4, 5]",
            "sample_output": "15"
        }
    
    try:
        prompt = (
            f"Create a coding challenge suitable for a {difficulty} candidate preparing for a {domain} technical interview. "
            "Include a problem statement, sample input, and sample output. "
            "Return STRICTLY valid JSON (no markdown) with keys prompt, sample_input, sample_output."
        )
        content = call_gemini(prompt)
        content = content.replace("```json", "").replace("```", "").strip()
        try:
            parsed = json.loads(content)
        except Exception:
            try:
                parsed = ast.literal_eval(content)
            except Exception:
                parsed = {"prompt": "Implement a direct algorithm.", "sample_input": "[]", "sample_output": ""}
        return parsed
    except Exception as e:
        logger.error(f"Error generating coding challenge: {str(e)}")
        return {"prompt": f"Solve a {difficulty} {domain} problem", "sample_input": "input", "sample_output": "output"}


def evaluate_coding_solution(challenge_text: str, solution: str, language: str) -> dict:
    """Evaluate a coding solution."""
    if not GEMINI_AVAILABLE:
        logger.warning("Gemini not available, using mock evaluation")
        solution_length = len(solution.split())
        if solution_length > 100:
            return {"score": 8, "feedback": ["Good implementation"], "improvements": ["Consider edge cases"]}
        elif solution_length > 30:
            return {"score": 6, "feedback": ["Basic solution"], "improvements": ["Optimize for performance"]}
        else:
            return {"score": 4, "feedback": ["Incomplete solution"], "improvements": ["Add more logic"]}
    
    try:
        prompt = (
            f"Evaluate the following {language} solution for this coding challenge:\n{challenge_text}\n"
            f"Solution:\n{solution}\n"
            "Return STRICTLY valid JSON (no markdown) with keys score, feedback (array), improvements (array)."
        )
        content = call_gemini(prompt)
        content = content.replace("```json", "").replace("```", "").strip()
        try:
            parsed = json.loads(content)
        except Exception:
            try:
                parsed = ast.literal_eval(content)
            except Exception:
                parsed = {"score": 7, "feedback": ["The logic is sound."], "improvements": ["Add edge-case checks."]}
        return parsed
    except Exception as e:
        logger.error(f"Error evaluating coding solution: {str(e)}")
        return {"score": 5, "feedback": ["Could not evaluate"], "improvements": ["Review your logic"]}
