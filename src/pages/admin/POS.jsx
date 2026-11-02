.pos-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
}

.pos-item-tap {
  all: unset;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.pos-item-tap:disabled {
  cursor: default;
}

.pos-item.in-cart {
  border-color: #1e3a5f;
}

.pos-item.sold-out {
  opacity: 0.5;
}

.pos-qty-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 6px;
}

.qty-input {
  width: 56px;
  text-align: center;
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 600;
}
