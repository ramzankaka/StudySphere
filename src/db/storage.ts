import { Subject, Material, Deadline, StudyNote } from '../types';

const DB_NAME = 'StudySphereAndroidDB';
const DB_VERSION = 1;

// Initial sample data so the user has a rich, ready-to-test academic organizer immediately
const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'subj-cs301',
    name: 'Data Structures & Algorithms',
    code: 'CS-301',
    color: 'indigo',
    icon: 'Code',
    instructor: 'Dr. Alan Vance',
    instructorEmail: 'avance@university.edu',
    room: 'Turing Hall 402',
    term: 'Fall 2026',
    credits: 4,
    description: 'Advanced trees, graphs, dynamic programming, sorting complexity, and greedy strategies.',
    targetGrade: 'A',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'subj-math204',
    name: 'Multivariable Calculus',
    code: 'MATH-204',
    color: 'emerald',
    icon: 'Calculator',
    instructor: 'Prof. Elena Rostova',
    instructorEmail: 'erostova@university.edu',
    room: 'Newton Math Wing 105',
    term: 'Fall 2026',
    credits: 3,
    description: 'Partial derivatives, multiple integrals, Stokes theorem, and vector fields.',
    targetGrade: 'A-',
    createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
  },
  {
    id: 'subj-phy102',
    name: 'Electromagnetism & Optics',
    code: 'PHY-102',
    color: 'rose',
    icon: 'Atom',
    instructor: 'Dr. Marcus Chen',
    instructorEmail: 'mchen@university.edu',
    room: 'Faraday Lab B-12',
    term: 'Fall 2026',
    credits: 4,
    description: 'Gauss Law, Maxwell equations, wave optics, interference, and electromagnetic induction.',
    targetGrade: 'A',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'subj-bio110',
    name: 'Cellular & Molecular Biology',
    code: 'BIO-110',
    color: 'amber',
    icon: 'FlaskConical',
    instructor: 'Dr. Sarah Sterling',
    instructorEmail: 'ssterling@university.edu',
    room: 'BioComplex 204',
    term: 'Fall 2026',
    credits: 3,
    description: 'Cell division, genetic transcription, enzyme kinetics, and metabolic pathways.',
    targetGrade: 'B+',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  }
];

// Sample materials with real readable text / previews
const DEFAULT_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    subjectId: 'subj-cs301',
    title: 'CS301 Course Syllabus & Grading Rubric',
    fileName: 'CS301_Syllabus_Fall2026.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    fileSize: 420000,
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg==', // lightweight placeholder or text representation
    uploadDate: new Date(Date.now() - 14 * 86400000).toISOString(),
    category: 'Syllabus',
    tags: ['Syllabus', 'Policies', 'Grading'],
    description: 'Full course policies, exam dates, homework submission guide, and academic integrity policies.'
  },
  {
    id: 'mat-2',
    subjectId: 'subj-cs301',
    title: 'Graph Algorithms & Dijkstra Cheatsheet',
    fileName: 'Dijkstra_AStar_Notes.md',
    fileType: 'code',
    mimeType: 'text/markdown',
    fileSize: 3450,
    fileData: `# Shortest Path Algorithms Quick Reference\n\n## Dijkstra's Algorithm\n- **Time Complexity:** O((V + E) log V) with min-heap priority queue\n- **Space Complexity:** O(V)\n- **Limitation:** Negative edge weights cause infinite loops or wrong results; use Bellman-Ford instead.\n\n\`\`\`python\nimport heapq\n\ndef dijkstra(graph, start):\n    distances = {node: float('inf') for node in graph}\n    distances[start] = 0\n    pq = [(0, start)]\n    \n    while pq:\n        cur_dist, u = heapq.heappop(pq)\n        if cur_dist > distances[u]:\n            continue\n        for v, weight in graph[u]:\n            if distances[u] + weight < distances[v]:\n                distances[v] = distances[u] + weight\n                heapq.heappush(pq, (distances[v], v))\n    return distances\n\`\`\`\n\n## Key Exam Traps\n1. Forgetting to relax edges\n2. Priority queue duplicate node stale check`,
    uploadDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: 'Cheat Sheet',
    tags: ['Graphs', 'Algorithms', 'Python', 'ExamPrep'],
    description: 'Python implementation, time complexities, and edge cases for shortest path algorithms.'
  },
  {
    id: 'mat-3',
    subjectId: 'subj-math204',
    title: 'Stokes Theorem & Divergence Summary Slides',
    fileName: 'Lecture14_VectorCalculus.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    fileSize: 890000,
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg==',
    uploadDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    category: 'Lecture Slides',
    tags: ['VectorCalculus', 'Stokes', 'Integrals'],
    description: 'Lecture 14 presentation slides covering surface integrals, curl, and Green’s Theorem.'
  },
  {
    id: 'mat-4',
    subjectId: 'subj-phy102',
    title: 'Maxwell Equations & Electromagnetic Wave Formulas',
    fileName: 'Physics_Formula_Sheet.txt',
    fileType: 'text',
    mimeType: 'text/plain',
    fileSize: 1820,
    fileData: `PHY-102 ELECTROMAGNETISM FORMULA REFERENCE SHEET\n\n1. Gauss's Law: ∮ E · dA = Q_enclosed / ε_0\n2. Gauss's Law for Magnetism: ∮ B · dA = 0\n3. Faraday's Law: ∮ E · ds = -dΦ_B / dt\n4. Ampere-Maxwell Law: ∮ B · ds = μ_0 * I + μ_0 * ε_0 * (dΦ_E / dt)\n\nWave Speed: c = 1 / sqrt(μ_0 * ε_0) ≈ 3.00 × 10^8 m/s\nPoynting Vector: S = (1 / μ_0) * (E × B)\nEnergy Density: u = (1/2) * ε_0 * E^2 + (1 / 2μ_0) * B^2`,
    uploadDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'Cheat Sheet',
    tags: ['Formulas', 'Maxwell', 'Midterm'],
    description: 'Official 1-page formula sheet allowed for midterm examinations.'
  }
];

// Sample deadlines with dates relative to now
const now = new Date();
const formatDateOffset = (days: number, hours = 14, minutes = 0) => {
  const d = new Date(now.getTime() + days * 86400000);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const DEFAULT_DEADLINES: Deadline[] = [
  {
    id: 'dl-1',
    subjectId: 'subj-cs301',
    title: 'Problem Set 4: Red-Black Tree Implementation',
    description: 'Implement left-rotate, right-rotate, and insertion rebalancing in Java/C++. Include unit tests.',
    dueDate: formatDateOffset(1, 23, 59),
    priority: 'urgent',
    type: 'assignment',
    status: 'in_progress',
    weightPercentage: 10,
  },
  {
    id: 'dl-2',
    subjectId: 'subj-math204',
    title: 'Midterm Exam: Multiple Integrals & Vector Fields',
    description: 'In-person closed book exam. Bring scientific calculator and student ID. Covers chapters 14.1 - 15.4.',
    dueDate: formatDateOffset(3, 10, 0),
    priority: 'high',
    type: 'exam',
    status: 'pending',
    weightPercentage: 25,
  },
  {
    id: 'dl-3',
    subjectId: 'subj-phy102',
    title: 'Lab Report 3: Faraday Induction & Solenoid Flux',
    description: 'Submit PDF report with error analysis calculations, graphs of induced EMF vs angular frequency.',
    dueDate: formatDateOffset(5, 17, 0),
    priority: 'medium',
    type: 'lab',
    status: 'pending',
    weightPercentage: 5,
  },
  {
    id: 'dl-4',
    subjectId: 'subj-bio110',
    title: 'Quiz 2: Enzyme Kinetics & Allosteric Regulation',
    description: 'Online canvas quiz. 20 questions, 30 minutes time limit. Lineweaver-Burk plots will be tested.',
    dueDate: formatDateOffset(7, 12, 0),
    priority: 'medium',
    type: 'quiz',
    status: 'pending',
    weightPercentage: 5,
  },
  {
    id: 'dl-5',
    subjectId: 'subj-cs301',
    title: 'Mini Project: Maze Solver using BFS & A*',
    description: 'Visual grid pathfinding demo submitted to GitHub repository with README instructions.',
    dueDate: formatDateOffset(-2, 23, 59),
    priority: 'high',
    type: 'project',
    status: 'completed',
    weightPercentage: 15,
    completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  }
];

const DEFAULT_NOTES: StudyNote[] = [
  {
    id: 'note-1',
    subjectId: 'subj-cs301',
    title: 'Dynamic Programming: 5-Step Recipe',
    chapter: 'Chapter 8: Optimization & DP',
    isPinned: true,
    summary: 'Universal framework for solving DP problems with state transitions and memoization table structure.',
    content: `# The 5-Step Dynamic Programming Framework\n\n### 1. Identify Subproblems\n- Define clearly what \`dp[i]\` or \`dp[i][j]\` represents in plain English.\n- Example: \`dp[i]\` = maximum profit obtainable using items up to index \`i\`.\n\n### 2. Formulate the State Transition Equation\n- Express the answer to a subproblem in terms of smaller subproblems.\n- \`dp[i] = max(dp[i-1], dp[i-2] + val[i])\`\n\n### 3. Base Cases\n- What are the simplest states that don't need calculation?\n- E.g., \`dp[0] = 0\`, \`dp[1] = val[0]\`.\n\n### 4. Computation Order\n- Bottom-up (iterative) vs Top-down (recursion + memoization).\n- Ensure dependencies are already computed before looking them up.\n\n### 5. Final Answer Extraction\n- Sometimes it is \`dp[n]\`, other times it is \`max(dp)\` across all states.\n\n### Checklist for Midterm\n- [x] Knapsack 0/1 vs Unbounded\n- [x] Longest Common Subsequence (LCS)\n- [ ] Matrix Chain Multiplication\n- [ ] Traveling Salesperson with Bitmask`,
    tags: ['DynamicProgramming', 'Algorithms', 'InterviewPrep'],
    flashcards: [
      {
        id: 'fc-1',
        question: 'What is the key difference between Divide & Conquer and Dynamic Programming?',
        answer: 'Divide and conquer divides problems into disjoint independent subproblems (like Merge Sort). DP is used when subproblems overlap and have optimal substructure.'
      },
      {
        id: 'fc-2',
        question: 'When is Top-Down DP preferred over Bottom-Up?',
        answer: 'Top-down (memoization) only computes states that are actually needed for the solution, while bottom-up typically computes all states in the table.'
      }
    ],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'note-2',
    subjectId: 'subj-math204',
    title: 'Triple Integrals in Cylindrical & Spherical Coordinates',
    chapter: 'Chapter 15: Multiple Integrals',
    isPinned: true,
    summary: 'Jacobian transformation factors and boundary setups for 3D coordinate systems.',
    content: `# Coordinate Conversions for Triple Integrals\n\n## 1. Cylindrical Coordinates $(r, \\theta, z)$\n- $x = r \\cos\\theta$\n- $y = r \\sin\\theta$\n- $z = z$\n- **Volume Element:** $dV = r \\, dr \\, d\\theta \\, dz$\n- **When to use:** Axial symmetry around the z-axis (cones, cylinders, paraboloids).\n\n## 2. Spherical Coordinates $(\\rho, \\phi, \\theta)$\n- $x = \\rho \\sin\\phi \\cos\\theta$\n- $y = \\rho \\sin\\phi \\sin\\theta$\n- $z = \\rho \\cos\\phi$\n- **Volume Element:** $dV = \\rho^2 \\sin\\phi \\, d\\rho \\, d\\phi \\, d\\theta$\n- **Important Angle Ranges:**\n  - $\\rho \\ge 0$\n  - $0 \\le \\phi \\le \\pi$ (polar angle from positive z-axis)\n  - $0 \\le \\theta \\le 2\\pi$ (azimuthal angle in xy-plane)\n- **When to use:** Spheres, ice cream cones, distance from origin squared $x^2+y^2+z^2 = \\rho^2$.`,
    tags: ['Calculus', 'Integrals', 'Cylindrical', 'Spherical'],
    flashcards: [
      {
        id: 'fc-3',
        question: 'What is the volume element dV in spherical coordinates?',
        answer: 'dV = ρ² sin(φ) dρ dφ dθ. Do not forget the ρ² sin(φ) Jacobian factor!'
      }
    ],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'note-3',
    subjectId: 'subj-phy102',
    title: 'Ampere Law vs Biot-Savart Law Comparison',
    chapter: 'Electromagnetism 101',
    isPinned: false,
    summary: 'When to choose symmetric path integration vs direct differential summation.',
    content: `# Magnetic Field Calculations\n\n### Biot-Savart Law\n- Universal for ANY wire geometry carrying steady current $I$.\n- $d\\vec{B} = \\frac{\\mu_0 I}{4\\pi} \\frac{d\\vec{s} \\times \\hat{r}}{r^2}$\n- Slower to integrate, but works when high symmetry is absent.\n\n### Ampere\'s Circuital Law\n- $\\oint \\vec{B} \\cdot d\\vec{\\ell} = \\mu_0 I_{enc}$\n- Only computationally helpful if $\\vec{B}$ has high symmetry along the chosen Amperian loop:\n  1. Infinite straight wire\n  2. Ideal infinite solenoid: $B = \\mu_0 n I$\n  3. Toroid: $B = \\frac{\\mu_0 N I}{2\\pi r}$\n  4. Thick infinite cylindrical conductor (inside vs outside)`,
    tags: ['Physics', 'Magnetism', 'Ampere'],
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  }
];

class StudyDatabase {
  private dbPromise: Promise<IDBDatabase | null>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains('subjects')) {
            db.createObjectStore('subjects', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('materials')) {
            const matStore = db.createObjectStore('materials', { keyPath: 'id' });
            matStore.createIndex('subjectId', 'subjectId', { unique: false });
          }
          if (!db.objectStoreNames.contains('deadlines')) {
            const dlStore = db.createObjectStore('deadlines', { keyPath: 'id' });
            dlStore.createIndex('subjectId', 'subjectId', { unique: false });
            dlStore.createIndex('dueDate', 'dueDate', { unique: false });
          }
          if (!db.objectStoreNames.contains('notes')) {
            const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
            noteStore.createIndex('subjectId', 'subjectId', { unique: false });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('IndexedDB failed to open, falling back to localStorage');
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB initialization error', err);
        resolve(null);
      }
    });
  }

  // Generic store reader
  private async getAllFromStore<T extends { id: string }>(storeName: string, fallbackKey: string, defaults: T[]): Promise<T[]> {
    const db = await this.dbPromise;
    if (!db) {
      const stored = localStorage.getItem(fallbackKey);
      const isInitialized = localStorage.getItem('studysphere_initialized') === 'true';
      if (!isInitialized) {
        localStorage.setItem('studysphere_initialized', 'true');
        localStorage.setItem(fallbackKey, JSON.stringify(defaults));
        return defaults;
      }
      if (!stored) {
        return [];
      }
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const results = request.result as T[];
          const isInitialized = localStorage.getItem('studysphere_initialized') === 'true';
          if (!isInitialized) {
            localStorage.setItem('studysphere_initialized', 'true');
            this.seedStore(storeName, defaults).then(() => resolve(defaults));
          } else {
            resolve(results || []);
          }
        };

        request.onerror = () => {
          resolve(defaults);
        };
      } catch (err) {
        console.error(`Error reading ${storeName}`, err);
        resolve(defaults);
      }
    });
  }

  private async seedStore<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
    const db = await this.dbPromise;
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        items.forEach((item) => store.put(item));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private async putItem<T extends { id: string }>(storeName: string, fallbackKey: string, item: T): Promise<void> {
    const db = await this.dbPromise;
    if (!db) {
      const all = await this.getAllFromStore<T>(storeName, fallbackKey, []);
      const index = all.findIndex((i) => i.id === item.id);
      if (index >= 0) {
        all[index] = item;
      } else {
        all.unshift(item);
      }
      localStorage.setItem(fallbackKey, JSON.stringify(all));
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  private async deleteItem<T extends { id: string }>(storeName: string, fallbackKey: string, id: string): Promise<void> {
    const db = await this.dbPromise;
    if (!db) {
      const all = await this.getAllFromStore<T>(storeName, fallbackKey, []);
      const filtered = all.filter((i) => i.id !== id);
      localStorage.setItem(fallbackKey, JSON.stringify(filtered));
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // --- SUBJECTS API ---
  async getSubjects(): Promise<Subject[]> {
    return this.getAllFromStore<Subject>('subjects', 'studysphere_subjects', DEFAULT_SUBJECTS);
  }

  async saveSubject(subject: Subject): Promise<void> {
    return this.putItem<Subject>('subjects', 'studysphere_subjects', subject);
  }

  async deleteSubject(id: string): Promise<void> {
    await this.deleteItem<Subject>('subjects', 'studysphere_subjects', id);
    // Also clean up materials, deadlines, notes associated with this subject
    const materials = await this.getMaterials();
    for (const m of materials) {
      if (m.subjectId === id) await this.deleteMaterial(m.id);
    }
    const deadlines = await this.getDeadlines();
    for (const d of deadlines) {
      if (d.subjectId === id) await this.deleteDeadline(d.id);
    }
    const notes = await this.getNotes();
    for (const n of notes) {
      if (n.subjectId === id) await this.deleteNote(n.id);
    }
  }

  // --- MATERIALS API ---
  async getMaterials(): Promise<Material[]> {
    return this.getAllFromStore<Material>('materials', 'studysphere_materials', DEFAULT_MATERIALS);
  }

  async saveMaterial(material: Material): Promise<void> {
    return this.putItem<Material>('materials', 'studysphere_materials', material);
  }

  async deleteMaterial(id: string): Promise<void> {
    return this.deleteItem<Material>('materials', 'studysphere_materials', id);
  }

  // --- DEADLINES API ---
  async getDeadlines(): Promise<Deadline[]> {
    return this.getAllFromStore<Deadline>('deadlines', 'studysphere_deadlines', DEFAULT_DEADLINES);
  }

  async saveDeadline(deadline: Deadline): Promise<void> {
    return this.putItem<Deadline>('deadlines', 'studysphere_deadlines', deadline);
  }

  async deleteDeadline(id: string): Promise<void> {
    return this.deleteItem<Deadline>('deadlines', 'studysphere_deadlines', id);
  }

  // --- STUDY NOTES API ---
  async getNotes(): Promise<StudyNote[]> {
    return this.getAllFromStore<StudyNote>('notes', 'studysphere_notes', DEFAULT_NOTES);
  }

  async saveNote(note: StudyNote): Promise<void> {
    return this.putItem<StudyNote>('notes', 'studysphere_notes', note);
  }

  async deleteNote(id: string): Promise<void> {
    return this.deleteItem<StudyNote>('notes', 'studysphere_notes', id);
  }

  // Delete all data across all tables with clean slate
  async deleteAllData(): Promise<void> {
    localStorage.setItem('studysphere_initialized', 'true');
    localStorage.removeItem('studysphere_subjects');
    localStorage.removeItem('studysphere_materials');
    localStorage.removeItem('studysphere_deadlines');
    localStorage.removeItem('studysphere_notes');

    const db = await this.dbPromise;
    if (db) {
      const stores = ['subjects', 'materials', 'deadlines', 'notes'];
      for (const s of stores) {
        try {
          const tx = db.transaction(s, 'readwrite');
          tx.objectStore(s).clear();
        } catch (e) {
          console.error(`Error clearing ${s}`, e);
        }
      }
    }
  }

  // Delete selected items by specific IDs
  async deleteSelected(params: {
    subjectIds?: string[];
    materialIds?: string[];
    deadlineIds?: string[];
    noteIds?: string[];
  }): Promise<void> {
    const { subjectIds = [], materialIds = [], deadlineIds = [], noteIds = [] } = params;
    for (const sid of subjectIds) {
      await this.deleteSubject(sid);
    }
    for (const mid of materialIds) {
      await this.deleteMaterial(mid);
    }
    for (const did of deadlineIds) {
      await this.deleteDeadline(did);
    }
    for (const nid of noteIds) {
      await this.deleteNote(nid);
    }
  }

  // Restore selected items into the database
  async restoreSelected(params: {
    subjects?: Subject[];
    materials?: Material[];
    deadlines?: Deadline[];
    notes?: StudyNote[];
  }): Promise<void> {
    const { subjects = [], materials = [], deadlines = [], notes = [] } = params;
    for (const s of subjects) {
      await this.saveSubject(s);
    }
    for (const m of materials) {
      await this.saveMaterial(m);
    }
    for (const d of deadlines) {
      await this.saveDeadline(d);
    }
    for (const n of notes) {
      await this.saveNote(n);
    }
  }

  // Reset database with defaults
  async resetToDefaults(): Promise<void> {
    localStorage.setItem('studysphere_initialized', 'true');
    localStorage.removeItem('studysphere_subjects');
    localStorage.removeItem('studysphere_materials');
    localStorage.removeItem('studysphere_deadlines');
    localStorage.removeItem('studysphere_notes');

    const db = await this.dbPromise;
    if (db) {
      const stores = ['subjects', 'materials', 'deadlines', 'notes'];
      for (const s of stores) {
        const tx = db.transaction(s, 'readwrite');
        tx.objectStore(s).clear();
      }
      await this.seedStore('subjects', DEFAULT_SUBJECTS);
      await this.seedStore('materials', DEFAULT_MATERIALS);
      await this.seedStore('deadlines', DEFAULT_DEADLINES);
      await this.seedStore('notes', DEFAULT_NOTES);
    }
  }

  // Export full JSON backup
  async exportBackup(): Promise<string> {
    const subjects = await this.getSubjects();
    const materials = await this.getMaterials();
    const deadlines = await this.getDeadlines();
    const notes = await this.getNotes();

    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      subjects,
      materials,
      deadlines,
      notes,
    }, null, 2);
  }

  // Import JSON backup
  async importBackup(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.subjects)) {
        for (const s of data.subjects) await this.saveSubject(s);
      }
      if (Array.isArray(data.materials)) {
        for (const m of data.materials) await this.saveMaterial(m);
      }
      if (Array.isArray(data.deadlines)) {
        for (const d of data.deadlines) await this.saveDeadline(d);
      }
      if (Array.isArray(data.notes)) {
        for (const n of data.notes) await this.saveNote(n);
      }
      return true;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  }
}

export const db = new StudyDatabase();
export { DEFAULT_SUBJECTS, DEFAULT_MATERIALS, DEFAULT_DEADLINES, DEFAULT_NOTES };
