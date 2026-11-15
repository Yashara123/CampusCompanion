#  CampusCompanion - Course & Assignment Mobile Companion

**CampusCompanion** is a feature-rich cross-platform mobile application built with **React Native** and **Expo**, designed specifically for university students to manage academic assessments, track course progress, compute precise semester and cumulative GPAs, and manage study schedules.

---

## Key Features & Academic Logic

1. **Official University Evaluation Rules (ICA & Exam Weightings):**
   - **Theory Modules:** Automatically calculates ICA marks based on the **Best 2 out of 3 ICAs** with a **30% contribution** to the final result (End Exam contributes 70%).
   - **Practical Modules:** Computes ICA marks using the **Best 2 out of 3 ICAs** with a **40% contribution** to the final result (End Exam contributes 60%).

2. **Dual-Component Course Units (Theory & Practical Credit Splits):**
   - Supports customized credit distributions per course unit (e.g., 2 Theory Credits + 1 Practical Credit).
   - Allows separate grade selections for Theory and Practical components in the GPA calculator, ensuring 100% academic precision:
     $$\text{Total Points} = (\text{Theory Credits} \times \text{Theory Grade Point}) + (\text{Practical Credits} \times \text{Practical Grade Point})$$

3. **Semester & Cumulative (Full) GPA Calculator:**
   - Real-time semester GPA calculation based on active course credits and selected expected grades.
   - Cumulative Full GPA calculator allowing students to input their previous earned credits and GPA to compute their overall academic standing.

4. **Dynamic Course & Task Management:**
   - Add, edit, and delete course units with persistent local storage using **AsyncStorage**.
   - Track sub-topics, lecture notes, and direct VLE/Google Drive resource links.

5. **Study Planner & Assignment Tracker:**
   - Built-in weekly/daily study planner and assignment checklists to keep students organized.

---

## Tech Stack

- **Framework:** React Native, Expo
- **Navigation:** React Navigation (Stack / Tabs)
- **Local Database / Persistence:** `@react-native-async-storage/async-storage`
- **UI Icons:** `@expo/vector-icons` (Ionicons)

---

## Getting Started & Installation

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/your-username/CampusCompanion.git](https://github.com/your-username/CampusCompanion.git)
   cd CampusCompanion