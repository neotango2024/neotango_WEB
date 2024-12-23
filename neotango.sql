-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-12-2024 a las 13:49:27
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

INSERT INTO `addresses` (`id`, `user_id`, `street`, `detail`, `zip_code`, `label`, `city`, `country_id`, `first_name`, `last_name`, `created_at`, `updated_at`, `deleted_at`) VALUES
('18c3aef1-2309-431e-afb2-4378c6c3215a', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', 'juana azurduy 1730', NULL, '1414', NULL, 'Buenos Aires', 'b925f508-c62f-4985-a252-27849d4bbdc2', 'Jano', 'Pereira', '2024-12-06 12:16:43', '2024-12-06 12:16:43', NULL),
('a20008c9-cf6d-49df-a293-c03cf0abe8bc', '2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', 'juana azurduy 1700', '205', '1400', NULL, 'Chubut', 'b925f508-c62f-4985-a252-27849d4bbdc2', 'Julian', 'Pereira', '2024-12-06 11:45:51', '2024-12-06 12:09:07', NULL);

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
  `main_image` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `name_copy1` varchar(255) NOT NULL,
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
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `user_role_id`, `gender_id`, `password_token`, `verified_email`, `verification_code`, `expiration_time`, `created_at`, `updated_at`, `deleted_at`) VALUES
('2d87a1d1-b7ae-4ea9-8139-ef808db2cc6d', 'jano', 'pereira', 'janoo.pereira@gmail.com', '$2a$10$JLOucGLW4B11ndtrB/v5Fe7e/xsILFwDlm2Y/2E6ybsTHQot3Elae', 1, 1, NULL, 1, NULL, NULL, '2024-12-06 08:45:51', '2024-12-06 08:45:51', NULL);

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
