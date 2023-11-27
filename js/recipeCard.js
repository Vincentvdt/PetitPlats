const createRecipeTemplate = ({id, image, name, time, description, ingredients}) => {
    const picturePath = `./assets/img/${image}`;

    const generateIngredientsHTML = () => {
        return ingredients.map(({ingredient: ingredientName, quantity, unit}) => {
            const quantityString = `${quantity || ''} ${unit || ''}`.trim();
            return `
               <div class="recipe-ingredient">
                  <p class="recipe-ingredient_name">${ingredientName}</p>
                  <p class="recipe-ingredient_quantity">${quantityString}</p>
               </div>
           `;
        }).join('');
    };

    const getRecipeHTML = () => {
        const htmlString = `
            <article class="recipe-card" id="${id}">
                <div class="recipe-time">
                    <span>${time}min</span>
                </div>
                <div class="recipe-img-container">
                    <img alt="${name}" src="${picturePath}">
                </div>
                <div class="recipe-content">
                    <div class="recipe-title">
                        <h2>${name}</h2>
                    </div>
                    <div class="recipe-infos">
                        <div class="recipe-description">
                            <h3>Recette</h3>
                            <p>${description}</p>
                        </div>
                        <div class="recipe-ingredients">
                            <h3>Ingrédients</h3>
                            <div class="recipe-ingredients_list">
                                ${generateIngredientsHTML()}
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        `;
        const parser = new DOMParser();
        const recipeNode = parser.parseFromString(htmlString, "text/html").body.firstChild;
        return recipeNode.cloneNode(true);
    };

    return {getRecipeHTML};
};
