-- Fix IP_ADDRESS column size to support IPv6 addresses
-- IPv6 addresses can be up to 45 characters (e.g., ::ffff:192.168.0.211)
-- Current size is varchar(18), which is too small

ALTER TABLE `userlog` MODIFY COLUMN `IP_ADDRESS` varchar(45) NOT NULL;

-- Verify the change
DESCRIBE `userlog`;
