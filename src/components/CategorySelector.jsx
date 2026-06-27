import { TEAM_CATEGORIES } from '../constants/categories'

function CategorySelector({ selectedCategory, onSelectCategory }) {
  return (
    <section className="category-panel" aria-labelledby="category-title">
      <div className="panel-header">
        <div>
          <h2 id="category-title">Category</h2>
          <p>팀 목록 조회 전에 사용할 카테고리 code를 선택합니다.</p>
        </div>
        <span className="selected-category-badge">
          {selectedCategory
            ? `${selectedCategory.label} (${selectedCategory.code})`
            : '선택되지 않음'}
        </span>
      </div>

      <div className="category-grid" aria-label="카테고리 선택">
        {TEAM_CATEGORIES.map((category) => {
          const isSelected = selectedCategory?.code === category.code

          return (
            <button
              aria-pressed={isSelected}
              className={isSelected ? 'category-button selected' : 'category-button'}
              key={category.code}
              onClick={() => onSelectCategory(category)}
              type="button"
            >
              <span>{category.label}</span>
              <small>{category.code}</small>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default CategorySelector
