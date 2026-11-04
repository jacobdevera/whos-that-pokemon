# Who's that Pokémon?

A modernized, interactive Pokémon guessing game inspired by the iconic TV segment. Built with React 18 and MUI v6, this application fetches real-time data from the [PokéAPI](https://pokeapi.co/) to test your Pokémon knowledge across every region.

**[🎮 Play the Demo](https://jacobdevera.github.io/whos-that-pokemon/)**

---

## ✨ Features

*   **Iconic Silhouette Reveal:** Just like the show, guess the Pokémon based on its silhouette. The full sprite is revealed only after a correct guess or when you give up.
*   **Forgiving Guesses:** Press Enter to submit. Capitals, spaces, accents and punctuation are ignored, so `mr mime`, `flabebe` and `nidoran f` all count.
*   **Step-by-Step Hints:** Each hint reveals a bit more: types, then name length with height and weight, then the first letter and abilities.
*   **Score & Streaks:** Track your score and current streak; your best streak is saved in the browser.
*   **Pro Pokedex Aesthetic:** A sleek "Deep Charcoal & Neon" design featuring 3D metallic textures, glowing LED status lights, and a classic retro screen.
*   **Regional Pokedexes:** Choose from every regional Pokédex PokéAPI offers (Kanto through Paldea and beyond) or go for the full National Pokédex.
*   **Scanning Effects:** The blue "Power" LED blinks during data fetches to simulate a device scan.
*   **Detailed Information:** After each round, see the Pokédex entry, height, weight, abilities, held items and game index numbers.
*   **Resilient:** Network failures show a clear message with a retry button instead of an endless loading bar.

## 🛠️ Tech Stack

*   **Frontend:** [React 18](https://reactjs.org/) (Functional Components, Hooks)
*   **UI Library:** [MUI v6](https://mui.com/)
*   **Data Source:** [PokéAPI](https://pokeapi.co/)
*   **Styling:** CSS3 (Gradients, Animations) & MUI `sx` prop
*   **Build & Tests:** [Vite](https://vite.dev/) and [Vitest](https://vitest.dev/) with Testing Library
*   **Deployment:** GitHub Actions (CI/CD)

## 🚀 Local Development

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jacobdevera/whos-that-pokemon.git
    cd whos-that-pokemon
    ```

2.  **Install dependencies** (Node 20.19+ or 22.12+):
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm start
    ```
    The app will open at `http://localhost:5173/whos-that-pokemon/`.

4.  **Run the tests:**
    ```bash
    npm test
    ```

## 📦 Automated Deployment

This project uses **GitHub Actions** for continuous deployment. Every push to the `master` branch triggers an automated workflow that:
1.  Installs dependencies.
2.  Runs the test suite.
3.  Creates an optimized production build.
4.  Deploys the build to the `gh-pages` branch.

Pull requests run the tests and build without deploying.

---

*Created and maintained by [Jacob Devera](https://github.com/jacobdevera).*
