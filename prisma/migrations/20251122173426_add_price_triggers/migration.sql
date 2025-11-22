-- This is an empty migration.
-- Create procedure (delimiter-free form)
DROP PROCEDURE IF EXISTS update_product_price_range;

CREATE PROCEDURE update_product_price_range(IN prodId INT)
BEGIN
  UPDATE product p
  JOIN (
    SELECT 
      MIN(price) AS min_price,
      MAX(price) AS max_price
    FROM product_variant
    WHERE product_id = prodId
  ) v
  SET 
    p.min_price = v.min_price,
    p.max_price = v.max_price
  WHERE p.id = prodId;
END;

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS trg_variant_insert;
DROP TRIGGER IF EXISTS trg_variant_update;
DROP TRIGGER IF EXISTS trg_variant_delete;

-- Create triggers
CREATE TRIGGER trg_variant_insert
AFTER INSERT ON product_variant
FOR EACH ROW
  CALL update_product_price_range(NEW.product_id);

CREATE TRIGGER trg_variant_update
AFTER UPDATE ON product_variant
FOR EACH ROW
  CALL update_product_price_range(NEW.product_id);

CREATE TRIGGER trg_variant_delete
AFTER DELETE ON product_variant
FOR EACH ROW
  CALL update_product_price_range(OLD.product_id);
