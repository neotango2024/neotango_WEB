-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: neotango
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `street` varchar(250) NOT NULL,
  `detail` varchar(60) DEFAULT NULL,
  `zip_code` varchar(10) NOT NULL,
  `label` varchar(100) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `country_id` varchar(36) NOT NULL,
  `default` tinyint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES ('616a4059-b5b1-4c89-8543-d287e15c875e','9f903bf7-2f13-4577-aa99-6745fe552bd5','4 Elm St','','90001','office','Los Angeles','CA','59bbc065-d532-4fa8-b868-962b5b9cea8c',0,'2024-12-24 14:34:32','2025-02-04 23:11:18',NULL),('75af7724-4756-4035-9af3-042eba3a4ad8','9f903bf7-2f13-4577-aa99-6745fe552bd5','123 Main St','Casa','10001','casita','New York','NY','59bbc065-d532-4fa8-b868-962b5b9cea8c',0,'2024-12-24 14:34:32','2025-02-04 23:11:18',NULL),('85af370d-19e0-4380-a861-d04a000042bd','9f903bf7-2f13-4577-aa99-6745fe552bd5','holaaa','','122','Nuevita sin async','ar','ra','fe6b649b-a307-44e6-9c1a-e6d9c5f2d6a4',NULL,'2025-01-05 22:46:27','2025-01-05 23:09:27','2025-02-03 22:00:45'),('d34ac121-e74b-4ea6-a1c7-4b4f9463eaac','9f903bf7-2f13-4577-aa99-6745fe552bd5','Juana Azurduy 1730','Casa','1429','Nueva','CABA','Buenos Aires','b925f508-c62f-4985-a252-27849d4bbdc2',1,'2025-01-05 22:42:45','2025-02-04 23:11:18',NULL);
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` varchar(36) NOT NULL,
  `temp_cart_item_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `temp_cart_item_id` (`temp_cart_item_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`temp_cart_item_id`) REFERENCES `temp_carts_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colors`
--

DROP TABLE IF EXISTS `colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `color` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colors`
--

LOCK TABLES `colors` WRITE;
/*!40000 ALTER TABLE `colors` DISABLE KEYS */;
/*!40000 ALTER TABLE `colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `files` (
  `id` varchar(36) NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `file_types_id` int DEFAULT NULL,
  `sections_id` int DEFAULT NULL,
  `main_file` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `files_ibfk_1` (`product_id`),
  CONSTRAINT `files_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
INSERT INTO `files` VALUES ('11e40d96-a5c9-446e-adf3-267ebeb67681','products-fhl32vxg08','9d623ef4-7149-49e6-81e2-b61c897fece3',1,2,1),('16d546aa-a866-48e9-ac52-6d22524f8711','products-09rbqop608','05d5545b-d7c6-402a-b2bf-11432539ab2a',1,2,1),('4df98fec-7a9d-434b-9670-a0f1b58556d7','products-a199sypcvu','b11c01ab-40a9-4ed8-930e-436a2d9526c8',1,2,1),('7008c7f4-696e-4fb1-a552-b654562728e7','products-bcnismfls4','122fb56d-85c8-48d5-ab3f-2ef5c8a9a669',1,2,1),('706ce26c-d810-4a12-9a45-4e0249c2dd43','products-6v350wbv07','29fa4ed8-0a4b-41f6-b9e1-e63068d610fa',1,2,1);
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` varchar(36) NOT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `es_name` varchar(255) DEFAULT NULL,
  `eng_name` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `taco` varchar(20) DEFAULT NULL,
  `size` varchar(20) DEFAULT NULL,
  `discount` tinyint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_ibfk_1` (`product_id`),
  KEY `order_items_ibfk_2` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES ('b2f7a779-b481-4cbe-8517-e8e638771f93','44477e59-a870-42c1-9ccc-642797e8ef0d','ba9234bb-b209-4630-9bdd-6abb32fd31ba','Zapato women','Women Shoe',120.00,1,'8.5cm','34',0,'2024-12-24 14:34:32','2024-12-24 14:34:32',NULL),('b3f7a779-b481-4cbe-8517-e8e638771f93','44377e59-a870-42c1-9ccc-642797e8ef0d','ba9234bb-b209-4630-9bdd-6abb32fd31ba',NULL,NULL,NULL,39,NULL,NULL,0,'2024-12-24 14:34:32','2024-12-24 14:34:32',NULL),('c2457061-29a7-4c10-b12b-f8941bba90eb','44477e59-a870-42c1-9ccc-642797e8ef0d','122fb56d-85c8-48d5-ab3f-2ef5c8a9a669','Zapato re cheto','Fancy Shoe',50.00,2,'Pastel','37',0,'2024-12-24 14:34:32','2024-12-24 14:34:32',NULL),('c3457061-29a7-4c10-b12b-f8941bba90eb','44377e59-a870-42c1-9ccc-642797e8ef0d','122fb56d-85c8-48d5-ab3f-2ef5c8a9a669',NULL,NULL,NULL,48,NULL,NULL,0,'2024-12-24 14:34:32','2024-12-24 14:34:32',NULL);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `tra_id` varchar(15) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `first_name` varchar(150) DEFAULT NULL,
  `last_name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `dni` varchar(40) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `order_status_id` int NOT NULL,
  `shipping_types_id` int NOT NULL,
  `payment_types_id` int NOT NULL,
  `billing_address_street` varchar(200) DEFAULT NULL,
  `billing_address_detail` varchar(200) DEFAULT NULL,
  `billing_address_city` varchar(200) DEFAULT NULL,
  `billing_address_province` varchar(200) DEFAULT NULL,
  `billing_address_zip_code` varchar(200) DEFAULT NULL,
  `billing_address_label` varchar(200) DEFAULT NULL,
  `billing_address_country_name` varchar(200) DEFAULT NULL,
  `shipping_address_street` varchar(200) DEFAULT NULL,
  `shipping_address_detail` varchar(200) DEFAULT NULL,
  `shipping_address_city` varchar(200) DEFAULT NULL,
  `shipping_address_province` varchar(200) DEFAULT NULL,
  `shipping_address_zip_code` varchar(200) DEFAULT NULL,
  `shipping_address_label` varchar(200) DEFAULT NULL,
  `shipping_address_country_name` varchar(200) DEFAULT NULL,
  `phone_code` varchar(50) DEFAULT NULL,
  `phone_number` varchar(100) DEFAULT NULL,
  `paypal_order_id` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_ibfk_3` (`user_id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('44377e59-a870-42c1-9ccc-642797e8ef0d','h32akl5m1t','ee3acc18-d968-45c3-8520-2651478f75dd','John','Doe','johndoe@example.com','12345678',135.00,5,2,1,'123 Main St','','New York','NY','10001','casa','United States','456 Elm St','4-c','Los Angeles','CA','90001','officce','United States','54','1234567890',NULL,'2024-12-21 14:34:32','2025-02-04 21:31:07',NULL),('44477e59-a870-42c1-9ccc-642797e8ef0d','h3j8kl5m1t','ee3acc18-d968-45c3-8520-2651478f75dd','John','Doe','johndoe@example.com','12345678',235.00,2,2,2,'123 Main St','','New York','NY','10001','casa','United States','456 Elm St','4-c','Los Angeles','CA','90001','officce','United States','54','1234567890',NULL,'2024-12-24 14:34:32','2025-02-06 18:48:27',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phone_numbers`
--

DROP TABLE IF EXISTS `phone_numbers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phone_numbers` (
  `id` varchar(36) NOT NULL,
  `phone_number` varchar(70) NOT NULL,
  `country_id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `default` tinyint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `phone_numbers_ibfk_1` (`user_id`),
  CONSTRAINT `phone_numbers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phone_numbers`
--

LOCK TABLES `phone_numbers` WRITE;
/*!40000 ALTER TABLE `phone_numbers` DISABLE KEYS */;
INSERT INTO `phone_numbers` VALUES ('0c395a51-5045-45ba-8dd0-bf4ecc4adf1d','232333','7b9143bf-05ed-4ae4-8034-5eb9f0255776','9f903bf7-2f13-4577-aa99-6745fe552bd5',1,'2025-02-03 22:49:15','2025-02-03 22:49:15','2025-02-03 22:50:59'),('0fe46596-1025-4072-b179-e79ee6633039','1234567890','b925f508-c62f-4985-a252-27849d4bbdc2','2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d',NULL,'2024-12-24 14:23:32','2024-12-24 14:23:32',NULL),('1e222ee9-cf0c-42e5-8451-f816e45f5eb7','1234567890','b925f508-c62f-4985-a252-27849d4bbdc2','2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d',NULL,'2024-12-24 14:24:01','2024-12-24 14:24:01',NULL),('21c3ea67-df1b-44f6-8582-6d6669a9fc38','4444444','2d1acec1-fbb0-4569-ab66-6eacc1bde0d0','9f903bf7-2f13-4577-aa99-6745fe552bd5',0,'2025-02-03 22:57:46','2025-02-03 22:59:59','2025-02-03 23:00:17'),('38d2f54a-357f-488b-afb9-b8043a8634ce','12234455','b925f508-c62f-4985-a252-27849d4bbdc2','9f903bf7-2f13-4577-aa99-6745fe552bd5',0,'2025-02-03 23:00:23','2025-02-04 23:09:49',NULL),('407643fe-3d9f-416c-adb7-204732a4d81b','1234567890','b925f508-c62f-4985-a252-27849d4bbdc2','2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d',NULL,'2024-12-24 14:34:32','2024-12-24 14:34:32',NULL),('69bf0b7e-7e50-4b44-96bf-537b85d59068','2222222','59bbc065-d532-4fa8-b868-962b5b9cea8c','9f903bf7-2f13-4577-aa99-6745fe552bd5',1,'2025-02-04 23:09:49','2025-02-04 23:09:49',NULL),('90a3963a-955c-4de4-8374-1ed66a855a1d','666666','59bbc065-d532-4fa8-b868-962b5b9cea8c','9f903bf7-2f13-4577-aa99-6745fe552bd5',0,'2025-02-03 22:54:20','2025-02-03 22:56:04','2025-02-03 22:57:37'),('97eba697-c40c-40c4-b142-7b0463d0a421','58817312','b04f146c-bc8d-4962-ac25-31d81ddf77b8','9f903bf7-2f13-4577-aa99-6745fe552bd5',0,'2025-02-03 22:51:09','2025-02-03 22:53:30','2025-02-03 22:54:08'),('a5b69001-e6a8-4329-ba84-1379c01671a2','55555','aa37d7ec-989c-44bd-a865-985acc5a1df7','9f903bf7-2f13-4577-aa99-6745fe552bd5',0,'2025-02-03 22:53:30','2025-02-03 22:54:20','2025-02-03 22:55:57'),('b8f8809b-02c2-4f0c-8b68-0241507a713f','1234567890','b925f508-c62f-4985-a252-27849d4bbdc2','2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d',NULL,'2024-12-24 14:29:25','2024-12-24 14:29:25',NULL),('c8cfec36-2425-40bf-aeed-b8c7fc53f435','1111111','992a50e1-b705-4268-8310-f6644543b0dd','9f903bf7-2f13-4577-aa99-6745fe552bd5',0,'2025-02-03 22:56:04','2025-02-03 22:57:46','2025-02-03 22:59:51'),('ca52ce5a-2847-4a58-9f25-166587ade3c6','223445566','b3742430-e9e3-4aca-8d75-f1f5eaa2c987','9f903bf7-2f13-4577-aa99-6745fe552bd5',1,'2025-02-03 22:59:59','2025-02-03 22:59:59','2025-02-03 23:00:15'),('d66c79c8-563c-4fd1-bfac-9010ff43eccb','1234567890','b925f508-c62f-4985-a252-27849d4bbdc2','2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d',NULL,'2024-12-24 14:23:21','2024-12-24 14:23:21',NULL),('dbdb2565-fee6-4696-acb8-4413bc3034c4','1234567890','b925f508-c62f-4985-a252-27849d4bbdc2','2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d',NULL,'2024-12-24 14:25:47','2024-12-24 14:25:47',NULL),('e36b1cd0-2b7f-4094-8d2b-ebd688259a1d','3233333333','992a50e1-b705-4268-8310-f6644543b0dd','9f903bf7-2f13-4577-aa99-6745fe552bd5',0,'2024-12-23 13:24:01','2025-02-03 22:51:09','2025-02-03 22:53:20'),('e3b0651f-f63b-4ae2-881f-addc57c55716','12345633','b925f508-c62f-4985-a252-27849d4bbdc2','9f903bf7-2f13-4577-aa99-6745fe552bd5',0,'2024-12-24 14:27:37','2025-02-03 22:59:59','2025-02-03 23:00:18'),('e5849a6e-36d2-4ddc-8c30-8f4484e4fe56','1234567890','b925f508-c62f-4985-a252-27849d4bbdc2','2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d',NULL,'2024-12-24 14:26:30','2024-12-24 14:26:30',NULL),('f01a6789-6764-4863-8cd0-a98edb34055a','211221','b04f146c-bc8d-4962-ac25-31d81ddf77b8','9f903bf7-2f13-4577-aa99-6745fe552bd5',NULL,'2025-01-29 15:04:08','2025-01-29 15:04:08','2025-02-03 22:48:04');
/*!40000 ALTER TABLE `phone_numbers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `es_name` varchar(255) NOT NULL,
  `eng_name` varchar(255) NOT NULL,
  `english_description` text NOT NULL,
  `spanish_description` text NOT NULL,
  `ars_price` decimal(10,2) unsigned NOT NULL,
  `usd_price` decimal(10,2) unsigned NOT NULL,
  `sku` varchar(200) DEFAULT NULL,
  `category_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('05d5545b-d7c6-402a-b2bf-11432539ab2a','Granos de Café Premium','Premium Coffee Beans','High-quality coffee beans sourced from Colombia.','Granos de café de alta calidad originarios de Colombia.',3500.00,20.00,'COFFEE123',1,'2024-12-24 14:08:53','2025-02-06 15:15:01',NULL),('122fb56d-85c8-48d5-ab3f-2ef5c8a9a669','Té Verde Orgánico','Organic Green Tea','A refreshing blend of organic green tea leaves.','Una mezcla refrescante de hojas de té verde orgánico.',2000.00,12.00,'TEA123',2,'2024-12-24 14:09:47','2025-02-04 14:59:40',NULL),('29fa4ed8-0a4b-41f6-b9e1-e63068d610fa','Barra de Chocolate Amargo','Dark Chocolate Bar','Premium dark chocolate with 70% cocoa content.','Chocolate amargo premium con 70% de contenido de cacao.',1200.00,7.00,'CHOCOLATE789',2,'2024-12-24 14:09:59','2025-02-04 21:07:26',NULL),('9d623ef4-7149-49e6-81e2-b61c897fece3','Zapato con joaco','Shoe with joaco','This is a shoe\r\n\r\nThat we just made','Es un zapato\r\n\r\nQue creamos recien',10000.00,10.00,'1321ssad',1,'2025-02-04 14:28:13','2025-02-04 21:05:25',NULL),('b11c01ab-40a9-4ed8-930e-436a2d9526c8','Zapato','Shoe new','Le\r\nro','Fut\r\nbo',50000.00,500.00,'123asd',2,'2025-01-31 23:23:50','2025-02-05 12:30:11',NULL),('b37c1711-f56c-4db6-875b-53cef200bf3c','Leche de Almendra','Almond Milk','A healthy and lactose-free almond milk option.','Una opción saludable y sin lactosa de leche de almendra.',3000.00,18.00,'MILK123',2,'2024-12-24 14:10:04','2024-12-24 14:10:04','2025-02-05 12:52:11'),('ba9234bb-b209-4630-9bdd-6abb32fd31ba','Miel Natural','Natural Honey','Pure honey harvested from organic farms.','Miel pura cosechada en granjas orgánicas.',1800.00,10.00,'HONEY456',1,'2024-12-24 14:09:54','2024-12-24 14:09:54','2025-02-05 12:51:24');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping_zones_prices`
--

DROP TABLE IF EXISTS `shipping_zones_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_zones_prices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `zone_id` int NOT NULL,
  `usd_price` decimal(10,2) NOT NULL,
  `ars_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_zones_prices`
--

LOCK TABLES `shipping_zones_prices` WRITE;
/*!40000 ALTER TABLE `shipping_zones_prices` DISABLE KEYS */;
INSERT INTO `shipping_zones_prices` VALUES (1,1,3.00,3000.00),(2,2,250.00,300000.00),(3,3,230.00,20000.00);
/*!40000 ALTER TABLE `shipping_zones_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `temp_carts_items`
--

DROP TABLE IF EXISTS `temp_carts_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `temp_carts_items` (
  `id` varchar(36) NOT NULL,
  `variation_id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `quantity` int NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `temp_carts_items_ibfk_1` (`user_id`),
  KEY `temp_carts_items_ibfk_2` (`variation_id`),
  CONSTRAINT `temp_carts_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `temp_carts_items_ibfk_2` FOREIGN KEY (`variation_id`) REFERENCES `variations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `temp_carts_items`
--

LOCK TABLES `temp_carts_items` WRITE;
/*!40000 ALTER TABLE `temp_carts_items` DISABLE KEYS */;
INSERT INTO `temp_carts_items` VALUES ('b325a368-0c75-4e8c-b68c-428789cbba02','db38ed64-5e5f-48a5-b925-ecec8d680e5d','9f903bf7-2f13-4577-aa99-6745fe552bd5',4,'2025-02-06 15:09:18'),('ba683659-97b6-4fe8-953e-ba5e904020fd','a15b8ceb-667f-49b9-8f5b-d18d5fe8fe2d','9f903bf7-2f13-4577-aa99-6745fe552bd5',1,'2025-02-04 23:09:05');
/*!40000 ALTER TABLE `temp_carts_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `first_name` varchar(200) NOT NULL,
  `last_name` varchar(200) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_role_id` int NOT NULL,
  `gender_id` int DEFAULT NULL,
  `password_token` text,
  `verified_email` tinyint DEFAULT NULL,
  `verification_code` varchar(6) DEFAULT NULL,
  `expiration_time` timestamp NULL DEFAULT NULL,
  `payment_type_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d','jano','pereira','janoo.pereira@gmail.com','$2a$10$JLOucGLW4B11ndtrB/v5Fe7e/xsILFwDlm2Y/2E6ybsTHQot3Elae',1,1,NULL,1,NULL,NULL,NULL,'2024-12-06 08:45:51','2024-12-06 08:45:51',NULL),('4df49fe6-6370-4d0c-a5f1-c218e99fcf6c','Valentina','Antonelli','valennantonelli@gmail.com','$2a$10$fJv/K2.K/9sLxAXApPYYAuNQS3fKp7xA3baiQSvBExVZm5tsqLw0e',2,NULL,NULL,1,NULL,NULL,NULL,'2024-12-31 23:30:29','2024-12-31 23:32:22',NULL),('9f903bf7-2f13-4577-aa99-6745fe552bd5','Jano','Pereira','janopk789@gmail.com','$2a$10$7MiKIbAvl0afvKhDg8QrvO0QjiUL12HLU7gBRaiw0wNAjoWknwIl2',1,1,NULL,1,NULL,NULL,1,'2024-12-30 13:33:26','2025-02-06 18:47:30',NULL),('aea71dc2-10f2-47c5-bf5f-7da8a65712a8','Julian','Gomez','janopk789@gmail.com','$2a$10$BIXNorFUI18RLqgN7F9eV.JkQyUA4bq4QTt.v3xxJR1SywVIjo2rq',2,NULL,NULL,0,NULL,NULL,NULL,'2024-12-30 13:30:53','2024-12-30 13:30:53','2024-12-30 15:40:24'),('c4b9cc6d-532e-4bac-a953-52decbffb44b','Esteban Juulian','Gorrs','jyjdhouse@gmail.com','$2a$10$JIaIZ.Wo1ZrXhBHE1F.D4uGu29Wdy9oUnjMBPL.ygL2FGubantj72',2,NULL,NULL,0,'986327','2024-12-30 19:10:25',NULL,'2024-12-30 18:40:25','2024-12-30 18:40:28','2025-01-03 22:39:01'),('d23ea66e-46f6-4d8b-b76a-11bb43099ddd','Jano','Pereira','jyjdhouse@gmail.com','$2a$10$xvqcezJruFe5PbFw2GuoHeCd5Hy0gkbCm0cWLWrrrYSmqCa65Llfi',2,NULL,NULL,1,NULL,NULL,NULL,'2025-01-03 22:38:37','2025-01-03 22:39:00',NULL),('e3a726d3-ea0f-42cf-9828-b4bbcc9c3a7d','Jano','Pereira','janopk789@gmail.com','$2a$10$tBU7DvT/1FQZbX8/X/h6y.mLWGx12fVu.q5DQEdgkTj9qZdP9DEjq',1,NULL,NULL,0,NULL,NULL,NULL,'2024-12-30 13:29:14','2024-12-30 13:29:14','2024-12-30 15:40:24'),('ee3acc18-d968-45c3-8520-2651478f75dd','Esteban','Gorrs','janopk789@gmail.com','$2a$10$SbS/gvhJuqhkLCuVy8Afp.e5F2gBc6drJIGjCJ.mKk4AQyl0XV2aW',2,NULL,NULL,0,'694436','2024-12-30 03:00:00',NULL,'2024-12-30 13:32:03','2024-12-30 13:32:05','2024-12-30 15:40:24');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variations`
--

DROP TABLE IF EXISTS `variations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variations` (
  `id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `size_id` int NOT NULL,
  `taco_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `variations_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variations`
--

LOCK TABLES `variations` WRITE;
/*!40000 ALTER TABLE `variations` DISABLE KEYS */;
INSERT INTO `variations` VALUES ('43c8c6d3-0c69-42cd-842f-3a6681d7288d','b11c01ab-40a9-4ed8-930e-436a2d9526c8',9,5,350),('51f5a7e4-b274-44a3-bbdf-4f6731ce1a73','122fb56d-85c8-48d5-ab3f-2ef5c8a9a669',2,6,350),('6392a880-4a79-41da-8904-8250b4c0031a','05d5545b-d7c6-402a-b2bf-11432539ab2a',5,1,10),('6721d235-9f32-4dc0-8596-99e52090287e','122fb56d-85c8-48d5-ab3f-2ef5c8a9a669',1,5,100),('a15b8ceb-667f-49b9-8f5b-d18d5fe8fe2d','9d623ef4-7149-49e6-81e2-b61c897fece3',8,2,410),('a6dea329-491b-4312-99c3-c093a14fa6db','ba9234bb-b209-4630-9bdd-6abb32fd31ba',1,1,1),('c4c705f5-e6d4-4dd6-b107-306287ba0aa9','ba9234bb-b209-4630-9bdd-6abb32fd31ba',2,3,25),('d1ce79ff-db34-42df-bd1d-8f8b4e54f25b','b37c1711-f56c-4db6-875b-53cef200bf3c',1,6,80),('db38ed64-5e5f-48a5-b925-ecec8d680e5d','29fa4ed8-0a4b-41f6-b9e1-e63068d610fa',2,5,30),('f09acf7f-83a4-4e3c-a8ee-83832bf9f0de','9d623ef4-7149-49e6-81e2-b61c897fece3',9,1,420),('fe224335-b0a9-4f80-adb2-bcc1bd56f223','b37c1711-f56c-4db6-875b-53cef200bf3c',2,7,40),('fecb8cbe-27d8-4f79-8f1a-b8590d0e4da0','29fa4ed8-0a4b-41f6-b9e1-e63068d610fa',1,7,60),('ffd7e654-c079-4903-8cf6-d0e8c5eeecee','b11c01ab-40a9-4ed8-930e-436a2d9526c8',8,5,410);
/*!40000 ALTER TABLE `variations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-06 15:59:51
