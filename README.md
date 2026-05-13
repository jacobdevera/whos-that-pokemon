# Who's that Pokémon?

A modernized, interactive Pokémon guessing game inspired by the iconic TV segment. Built with React 18 and MUI v6, this application fetches real-time data from the [PokéAPI](https://pokeapi.co/) to test your Pokémon knowledge across every region.

**[🎮 Play the Demo](https://jacobdevera.github.io/whos-that-pokemon/)**

---

## ✨ Features

*   **Iconic Silhouette Reveal:** Just like the show, guess the Pokémon based on its silhouette. The full sprite is revealed only after a correct guess or when you give up.
*   **Pro Pokedex Aesthetic:** A sleek "Deep Charcoal & Neon" design featuring 3D metallic textures, glowing LED status lights, and a classic retro screen.
*   **Regional Pokedexes:** Choose from various regional Pokedexes (Kanto, Johto, Hoenn, etc.) or go for the full National Pokedex.
*   **Scanning Effects:** The blue "Power" LED blinks during data fetches to simulate a device scan.
*   **Detailed Information:** View heights, weights, abilities, and regional entry numbers for every Pokémon you encounter.
*   **Modern Infrastructure:** Fully upgraded to React 18 and MUI v6 for a stable, high-performance experience.

## 🛠️ Tech Stack

*   **Frontend:** [React 18](https://reactjs.org/) (Functional Components, Hooks)
*   **UI Library:** [MUI v6](https://mui.com/)
*   **Data Source:** [PokéAPI](https://pokeapi.co/)
*   **Styling:** CSS3 (Gradients, Animations) & MUI `sx` prop
*   **Deployment:** GitHub Actions (CI/CD)

## 🚀 Local Development

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jacobdevera/whos-that-pokemon.git
    cd whos-that-pokemon
    ```

2.  **Install dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Start the development server:**
    ```bash
    npm start
    ```
    The app will open at `http://localhost:3000`.

## 📦 Automated Deployment

This project uses **GitHub Actions** for continuous deployment. Every push to the `master` branch triggers an automated workflow that:
1.  Installs dependencies.
2.  Creates an optimized production build.
3.  Deploys the build to the `gh-pages` branch.

---

*Created and maintained by [Jacob Devera](https://github.com/jacobdevera).*
