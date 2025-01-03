-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-12-2024 a las 19:45:53
-- Versión del servidor: 10.4.24-MariaDB
-- Versión de PHP: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `neotango`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `addresses`
--

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
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `street`, `detail`, `zip_code`, `label`, `city`, `province`, `country_id`, `first_name`, `last_name`, `created_at`, `updated_at`, `deleted_at`) VALUES
('616a4059-b5b1-4c89-8543-d287e15c875e', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', '456 Elm St', '4-c', '90001', 'officce', 'Los Angeles', 'CA', '59bbc065-d532-4fa8-b868-962b5b9cea8c', '', '', '2024-12-24 14:34:32', '2024-12-24 14:34:32', NULL),
('75af7724-4756-4035-9af3-042eba3a4ad8', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', '123 Main St', NULL, '10001', 'casa', 'New York', 'NY', '59bbc065-d532-4fa8-b868-962b5b9cea8c', '', '', '2024-12-24 14:34:32', '2024-12-24 14:34:32', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carts`
--

CREATE TABLE `carts` (
  `id` varchar(36) NOT NULL,
  `temp_cart_item_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colors`
--

CREATE TABLE `colors` (
  `id` int(11) NOT NULL,
  `color` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `files`
--

CREATE TABLE `files` (
  `id` varchar(36) NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `file_types_id` int(11) DEFAULT NULL,
  `sections_id` int(11) DEFAULT NULL,
  `main_file` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `files`
--

INSERT INTO `files` (`id`, `filename`, `product_id`, `file_types_id`, `sections_id`, `main_file`) VALUES
('16d546aa-a866-48e9-ac52-6d22524f8711', 'products-09rbqop608', '05d5545b-d7c6-402a-b2bf-11432539ab2a', 1, 2, 1),
('39ca2243-88c8-4452-8f87-e2b0a5b07553', 'products-1tb3q1jjjf', '05d5545b-d7c6-402a-b2bf-11432539ab2a', 1, 2, 0),
('6b448d83-d16d-4921-9574-c6670d539bd6', 'products-6fxopmibdh', '29fa4ed8-0a4b-41f6-b9e1-e63068d610fa', 1, 2, 0),
('706ce26c-d810-4a12-9a45-4e0249c2dd43', 'products-6v350wbv07', '29fa4ed8-0a4b-41f6-b9e1-e63068d610fa', 1, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL,
  `tra_id` varchar(15) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `first_name` varchar(150) DEFAULT NULL,
  `last_name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `dni` varchar(40) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `order_status_id` int(11) NOT NULL,
  `shipping_types_id` int(11) NOT NULL,
  `payment_types_id` int(11) NOT NULL,
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
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `orders`
--

INSERT INTO `orders` (`id`, `tra_id`, `user_id`, `first_name`, `last_name`, `email`, `dni`, `total`, `order_status_id`, `shipping_types_id`, `payment_types_id`, `billing_address_street`, `billing_address_detail`, `billing_address_city`, `billing_address_province`, `billing_address_zip_code`, `billing_address_label`, `billing_address_country_name`, `shipping_address_street`, `shipping_address_detail`, `shipping_address_city`, `shipping_address_province`, `shipping_address_zip_code`, `shipping_address_label`, `shipping_address_country_name`, `phone_code`, `phone_number`, `created_at`, `updated_at`, `deleted_at`) VALUES
('44477e59-a870-42c1-9ccc-642797e8ef0d', 'h3j8kl5m1t', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', 'John', 'Doe', 'johndoe@example.com', '12345678', '0.00', 3, 2, 1, '123 Main St', '', 'New York', 'NY', '10001', 'casa', 'United States', '456 Elm St', '4-c', 'Los Angeles', 'CA', '90001', 'officce', 'United States', '54', '1234567890', '2024-12-24 14:34:32', '2024-12-24 14:34:32', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(36) NOT NULL,
  `order_id` varchar(36) DEFAULT NULL,
  `product_id` varchar(36) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `discount` tinyint(4) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `name`, `price`, `quantity`, `discount`, `created_at`, `updated_at`, `deleted_at`) VALUES
('b2f7a779-b481-4cbe-8517-e8e638771f93', '44477e59-a870-42c1-9ccc-642797e8ef0d', 'ba9234bb-b209-4630-9bdd-6abb32fd31ba', NULL, NULL, 39, 0, '2024-12-24 14:34:32', '2024-12-24 14:34:32', NULL),
('c2457061-29a7-4c10-b12b-f8941bba90eb', '44477e59-a870-42c1-9ccc-642797e8ef0d', '122fb56d-85c8-48d5-ab3f-2ef5c8a9a669', NULL, NULL, 48, 0, '2024-12-24 14:34:32', '2024-12-24 14:34:32', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `phone_numbers`
--

CREATE TABLE `phone_numbers` (
  `id` varchar(36) NOT NULL,
  `phone_number` varchar(70) NOT NULL,
  `country_id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `phone_numbers`
--

INSERT INTO `phone_numbers` (`id`, `phone_number`, `country_id`, `user_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
('0fe46596-1025-4072-b179-e79ee6633039', '1234567890', 'b925f508-c62f-4985-a252-27849d4bbdc2', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', '2024-12-24 14:23:32', '2024-12-24 14:23:32', NULL),
('1e222ee9-cf0c-42e5-8451-f816e45f5eb7', '1234567890', 'b925f508-c62f-4985-a252-27849d4bbdc2', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', '2024-12-24 14:24:01', '2024-12-24 14:24:01', NULL),
('407643fe-3d9f-416c-adb7-204732a4d81b', '1234567890', 'b925f508-c62f-4985-a252-27849d4bbdc2', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', '2024-12-24 14:34:32', '2024-12-24 14:34:32', NULL),
('b8f8809b-02c2-4f0c-8b68-0241507a713f', '1234567890', 'b925f508-c62f-4985-a252-27849d4bbdc2', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', '2024-12-24 14:29:25', '2024-12-24 14:29:25', NULL),
('d66c79c8-563c-4fd1-bfac-9010ff43eccb', '1234567890', 'b925f508-c62f-4985-a252-27849d4bbdc2', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', '2024-12-24 14:23:21', '2024-12-24 14:23:21', NULL),
('dbdb2565-fee6-4696-acb8-4413bc3034c4', '1234567890', 'b925f508-c62f-4985-a252-27849d4bbdc2', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', '2024-12-24 14:25:47', '2024-12-24 14:25:47', NULL),
('e36b1cd0-2b7f-4094-8d2b-ebd688259a1d', '3233333333', 'b925f508-c62f-4985-a252-27849d4bbdc2', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', '2024-12-23 13:24:01', '2024-12-23 13:26:06', NULL),
('e3b0651f-f63b-4ae2-881f-addc57c55716', '1234567890', 'b925f508-c62f-4985-a252-27849d4bbdc2', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', '2024-12-24 14:27:37', '2024-12-24 14:27:37', NULL),
('e5849a6e-36d2-4ddc-8c30-8f4484e4fe56', '1234567890', 'b925f508-c62f-4985-a252-27849d4bbdc2', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', '2024-12-24 14:26:30', '2024-12-24 14:26:30', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `es_name` varchar(255) NOT NULL,
  `eng_name` varchar(255) NOT NULL,
  `english_description` text NOT NULL,
  `spanish_description` text NOT NULL,
  `ars_price` decimal(10,2) UNSIGNED NOT NULL,
  `usd_price` decimal(10,2) UNSIGNED NOT NULL,
  `sku` varchar(200) DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `deleted_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `es_name`, `eng_name`, `english_description`, `spanish_description`, `ars_price`, `usd_price`, `sku`, `category_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
('05d5545b-d7c6-402a-b2bf-11432539ab2a', 'Granos de Café Premium', 'Premium Coffee Beans', 'High-quality coffee beans sourced from Colombia.', 'Granos de café de alta calidad originarios de Colombia.', '3500.50', '20.00', 'COFFEE123', 1, '2024-12-24 14:08:53', '2024-12-24 14:08:53', '0000-00-00 00:00:00'),
('122fb56d-85c8-48d5-ab3f-2ef5c8a9a669', 'Té Verde Orgánico', 'Organic Green Tea', 'A refreshing blend of organic green tea leaves.', 'Una mezcla refrescante de hojas de té verde orgánico.', '2000.00', '12.00', 'TEA123', 2, '2024-12-24 14:09:47', '2024-12-24 14:09:47', '0000-00-00 00:00:00'),
('29fa4ed8-0a4b-41f6-b9e1-e63068d610fa', 'Barra de Chocolate Amargo', 'Dark Chocolate Bar', 'Premium dark chocolate with 70% cocoa content.', 'Chocolate amargo premium con 70% de contenido de cacao.', '1200.00', '7.00', 'CHOCOLATE789', 2, '2024-12-24 14:09:59', '2024-12-24 14:09:59', '0000-00-00 00:00:00'),
('b37c1711-f56c-4db6-875b-53cef200bf3c', 'Leche de Almendra', 'Almond Milk', 'A healthy and lactose-free almond milk option.', 'Una opción saludable y sin lactosa de leche de almendra.', '3000.00', '18.00', 'MILK123', 1, '2024-12-24 14:10:04', '2024-12-24 14:10:04', '0000-00-00 00:00:00'),
('ba9234bb-b209-4630-9bdd-6abb32fd31ba', 'Miel Natural', 'Natural Honey', 'Pure honey harvested from organic farms.', 'Miel pura cosechada en granjas orgánicas.', '1800.00', '10.00', 'HONEY456', 1, '2024-12-24 14:09:54', '2024-12-24 14:09:54', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `shipping_zones_prices`
--

CREATE TABLE `shipping_zones_prices` (
  `id` int(11) NOT NULL,
  `zone` varchar(100) NOT NULL,
  `usd_price` decimal(10,2) NOT NULL,
  `ars_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `temp_carts_items`
--

CREATE TABLE `temp_carts_items` (
  `id` varchar(36) NOT NULL,
  `variation_id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `first_name` varchar(200) NOT NULL,
  `last_name` varchar(200) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_role_id` int(11) NOT NULL,
  `gender_id` int(11) DEFAULT NULL,
  `password_token` text DEFAULT NULL,
  `verified_email` tinyint(4) DEFAULT NULL,
  `verification_code` varchar(6) DEFAULT NULL,
  `expiration_time` date DEFAULT NULL,
  `preffered_language` varchar(3) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `user_role_id`, `gender_id`, `password_token`, `verified_email`, `verification_code`, `expiration_time`, `preffered_language`, `created_at`, `updated_at`, `deleted_at`) VALUES
('2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', 'jano', 'pereira', 'janoo.pereira@gmail.com', '$2a$10$JLOucGLW4B11ndtrB/v5Fe7e/xsILFwDlm2Y/2E6ybsTHQot3Elae', 1, 1, NULL, 1, NULL, NULL, NULL, '2024-12-06 08:45:51', '2024-12-06 08:45:51', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `variations`
--

CREATE TABLE `variations` (
  `id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `size_id` int(11) NOT NULL,
  `taco_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `variations`
--

INSERT INTO `variations` (`id`, `product_id`, `size_id`, `taco_id`, `quantity`) VALUES
('5db40286-3a4b-4a30-b183-c41da81ca533', '29fa4ed8-0a4b-41f6-b9e1-e63068d610fa', 1, 4, 60),
('9ca13df4-2e5b-4f3e-9e04-ae743dc983ad', '122fb56d-85c8-48d5-ab3f-2ef5c8a9a669', 1, 1, 100),
('a6dea329-491b-4312-99c3-c093a14fa6db', 'ba9234bb-b209-4630-9bdd-6abb32fd31ba', 1, 1, 1),
('c4c705f5-e6d4-4dd6-b107-306287ba0aa9', 'ba9234bb-b209-4630-9bdd-6abb32fd31ba', 2, 3, 25),
('c83333ec-ec86-47d8-8d67-ee8ba929eac8', '122fb56d-85c8-48d5-ab3f-2ef5c8a9a669', 2, 2, 0),
('d1ce79ff-db34-42df-bd1d-8f8b4e54f25b', 'b37c1711-f56c-4db6-875b-53cef200bf3c', 1, 6, 80),
('dfce537b-5c4a-4ffd-9a0a-d65683509892', '05d5545b-d7c6-402a-b2bf-11432539ab2a', 2, 2, 30),
('f5dc0ef4-d96d-4407-9507-380f7e8f2d8c', '05d5545b-d7c6-402a-b2bf-11432539ab2a', 1, 1, 50),
('fe224335-b0a9-4f80-adb2-bcc1bd56f223', 'b37c1711-f56c-4db6-875b-53cef200bf3c', 2, 7, 40),
('ffaef4f2-13dc-46bd-9dfe-e4eb00c0465d', '29fa4ed8-0a4b-41f6-b9e1-e63068d610fa', 2, 5, 30);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `temp_cart_item_id` (`temp_cart_item_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `colors`
--
ALTER TABLE `colors`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `files_ibfk_1` (`product_id`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_ibfk_3` (`user_id`);

--
-- Indices de la tabla `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_ibfk_1` (`product_id`),
  ADD KEY `order_items_ibfk_2` (`order_id`);

--
-- Indices de la tabla `phone_numbers`
--
ALTER TABLE `phone_numbers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `phone_numbers_ibfk_1` (`user_id`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `shipping_zones_prices`
--
ALTER TABLE `shipping_zones_prices`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `temp_carts_items`
--
ALTER TABLE `temp_carts_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `temp_carts_items_ibfk_1` (`user_id`),
  ADD KEY `temp_carts_items_ibfk_2` (`variation_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `variations`
--
ALTER TABLE `variations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `colors`
--
ALTER TABLE `colors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `shipping_zones_prices`
--
ALTER TABLE `shipping_zones_prices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`temp_cart_item_id`) REFERENCES `temp_carts_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `files_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `phone_numbers`
--
ALTER TABLE `phone_numbers`
  ADD CONSTRAINT `phone_numbers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `temp_carts_items`
--
ALTER TABLE `temp_carts_items`
  ADD CONSTRAINT `temp_carts_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `temp_carts_items_ibfk_2` FOREIGN KEY (`variation_id`) REFERENCES `variations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `variations`
--
ALTER TABLE `variations`
  ADD CONSTRAINT `variations_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
