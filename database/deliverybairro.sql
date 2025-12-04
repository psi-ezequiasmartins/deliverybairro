-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 03, 2025 at 03:29 PM
-- Server version: 8.0.36
-- PHP Version: 8.2.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `deliverybairro`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `ADMIN_ID` int NOT NULL,
  `USER_EMAIL` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `USER_PASSWORD` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NOME` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ROLE` enum('SUPER_ADMIN','ADMIN','SUPPORT') COLLATE utf8mb4_unicode_ci DEFAULT 'ADMIN',
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `LAST_LOGIN` timestamp NULL DEFAULT NULL,
  `ACTIVE` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`ADMIN_ID`, `USER_EMAIL`, `USER_PASSWORD`, `NOME`, `ROLE`, `CREATED_AT`, `LAST_LOGIN`, `ACTIVE`) VALUES
(1, 'admin@deliverybairro.com', '$2b$10$5PyAyOnR/BDsDUL/VqTydeOBHXU82jd2yiyZLjkruiTpCHMeJHxU6', 'Administrador', 'SUPER_ADMIN', '2025-12-03 13:56:41', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `categorias`
--

CREATE TABLE `categorias` (
  `CATEGORIA_ID` int NOT NULL,
  `CATEGORIA_NOME` varchar(100) DEFAULT NULL,
  `URL_IMAGEM` varchar(240) NOT NULL,
  `ORDEM` tinyint DEFAULT NULL,
  `CHV` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `categorias`
--

INSERT INTO `categorias` (`CATEGORIA_ID`, `CATEGORIA_NOME`, `URL_IMAGEM`, `ORDEM`, `CHV`) VALUES
(101, 'OFERTAS', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/categorias%2Fofertas.jpg?alt=media&token=09be1bc9-e1e6-4bfd-96bc-7ddde99f6ca8', 1, '1'),
(102, 'SANDUICHES', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/categorias%2Fsanduiches.jpg?alt=media&token=6d5ec164-14f1-4155-b811-68c06817dcf9', 2, '1'),
(103, 'HOTDOGS', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/categorias%2Fhotdogs.jpg?alt=media&token=3b5e2cfb-6c14-473e-839c-77d7f2bbc603', 3, '1'),
(104, 'BEBIDAS', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/categorias%2Fbebidas.jpg?alt=media&token=483261bf-e614-4595-be00-f28960b76b08', 4, '1'),
(105, 'PRATOS & PORÇÕES', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/categorias%2Fpratos-e-porcoes.jpg?alt=media&token=5674c103-599a-4d25-b2ae-67112421d727', 5, '1'),
(106, 'SUSHI', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/categorias%2Fsushi.jpg?alt=media&token=2714e481-e100-4032-aca3-5507cdabab10', 6, '1'),
(107, 'FRUTAS & VERDURAS', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/categorias%2Ffrutas-e-verduras.jpg?alt=media&token=96b9fc23-3d36-4a54-be07-efe3c1de0577', 7, '1'),
(108, 'MEDICAMENTOS', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/categorias%2Ffarmarcias-e-drograrias.jpg?alt=media&token=9980f634-d422-4584-a145-c72f13a7e5af', 8, '0'),
(109, 'GÁS DE COZINHA', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/categorias%2Fgas-de-cozinha.jpg?alt=media&token=30cc52d5-2aed-4793-afd9-3285b85d733f', 9, '1'),
(110, 'FLORICULTURA', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/categorias%2Ffloricultura.jpg?alt=media&token=25adf89e-4424-4d1e-b936-5b7101f4c8e8', 10, '0'),
(111, 'ÁGUA MINERAL', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/categorias%2Fagua-mineral.jpg?alt=media&token=54dae688-bde6-4bd4-9203-cb9b13bbeea6', 11, '1'),
(112, 'MERCADO', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/categorias%2Fsupermercado.jpg?alt=media&token=ae6f286a-8eec-4f67-87c8-9e4a3051882d', 12, '0');

-- --------------------------------------------------------

--
-- Table structure for table `couriers`
--

CREATE TABLE `couriers` (
  `COURIER_ID` int NOT NULL,
  `FIREBASE_UID` varchar(128) NOT NULL,
  `NOME` varchar(60) NOT NULL,
  `SOBRENOME` varchar(60) NOT NULL,
  `TELEFONE` varchar(18) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `TRANSPORTE` enum('DRIVING','BICYCLING','WALKING') NOT NULL,
  `PLACA` varchar(10) NOT NULL,
  `URL_IMAGEM` varchar(240) NOT NULL,
  `CHV` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `couriers`
--

INSERT INTO `couriers` (`COURIER_ID`, `FIREBASE_UID`, `NOME`, `SOBRENOME`, `TELEFONE`, `EMAIL`, `TRANSPORTE`, `PLACA`, `URL_IMAGEM`, `CHV`) VALUES
(200001, '', 'Zé das Couves', '', '+55 31 98410-7540', '', 'DRIVING', '', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/couriers%2Fzedascouves.png?alt=media&token=efd215ba-70ae-450b-8aa0-7b978c56559e', '1'),
(200002, 'qQDKZ90m0RM6SGQyyNiIAbiXAND2', 'Ezequias', 'Martins ', '(31) 98410-7540', 'ezequiasmartins@yahoo.com.br', 'BICYCLING', 'AAAA-9999 ', '', '1');

-- --------------------------------------------------------

--
-- Table structure for table `deliveries`
--

CREATE TABLE `deliveries` (
  `DELIVERY_ID` int NOT NULL,
  `DELIVERY_NOME` varchar(100) NOT NULL,
  `PLANO` enum('FREE','BASIC','PRO','PREMIUM') DEFAULT 'FREE',
  `CATEGORIA_ID` int DEFAULT NULL,
  `RESPONSAVEL` varchar(60) DEFAULT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `TELEFONE` varchar(18) DEFAULT NULL,
  `HORARIO` varchar(100) DEFAULT NULL,
  `MIN_DELIVERY_TIME` int DEFAULT NULL,
  `MAX_DELIVERY_TIME` int DEFAULT NULL,
  `TAXA_ENTREGA` float DEFAULT NULL,
  `RATING` float DEFAULT NULL,
  `URL_IMAGEM` varchar(240) DEFAULT NULL,
  `CEP` varchar(9) DEFAULT NULL,
  `ENDERECO` varchar(100) DEFAULT NULL,
  `NUMERO` varchar(10) DEFAULT NULL,
  `COMPLEMENTO` varchar(30) DEFAULT NULL,
  `BAIRRO` varchar(60) DEFAULT NULL,
  `CIDADE` varchar(35) DEFAULT NULL,
  `UF` varchar(2) DEFAULT NULL,
  `LATITUDE` decimal(9,6) DEFAULT NULL,
  `LONGITUDE` decimal(9,6) DEFAULT NULL,
  `CHV` varchar(1) NOT NULL DEFAULT '1',
  `VALIDATION_CODE` varchar(16) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `deliveries`
--

INSERT INTO `deliveries` (`DELIVERY_ID`, `DELIVERY_NOME`, `PLANO`, `CATEGORIA_ID`, `RESPONSAVEL`, `EMAIL`, `TELEFONE`, `HORARIO`, `MIN_DELIVERY_TIME`, `MAX_DELIVERY_TIME`, `TAXA_ENTREGA`, `RATING`, `URL_IMAGEM`, `CEP`, `ENDERECO`, `NUMERO`, `COMPLEMENTO`, `BAIRRO`, `CIDADE`, `UF`, `LATITUDE`, `LONGITUDE`, `CHV`, `VALIDATION_CODE`) VALUES
(1001, 'Cantin d\'Minas Delivery', 'PRO', 105, 'José Antônio de Oliveira e Cida', 'joseantoniodeoliveira71@gmail.com', '+55 31 98775-9781', 'Aberto das 9h até às 19h de Segunda a Sábado', 15, 30, 4.5, 4.9, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/deliverys%2Fcantindminasdelivery.jpg?alt=media&token=a6259473-4eb1-4f0e-98ce-251b151bab9f', '31530-390', 'Rua Antônio Junqueira Júnior', '77', '', 'Santa Mônica', 'Belo Horizonte', 'MG', -19.826684, -43.983459, '1', NULL),
(1002, 'Sanduba do Zé', 'PREMIUM', 102, 'Zé das Couves', 'zedascouves@email.com', '+55 31 98410-7540', 'Aberto todos os dias a partir das 19h exceto às segundas feiras (fechado)', 15, 45, 4, 3.5, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/deliverys%2Fsandubadoze.jpg?alt=media&token=3bac7899-904e-4acd-aac8-75506a1d6819', '31525-365', 'Rua Érico Veríssimo', '2267', 'Loja B', 'Santa Mônica', 'Belo Horizonte', 'MG', -19.822279, -43.978664, '1', NULL),
(1003, 'Hotdog da Maria', 'PRO', 103, 'Maria das Graças ', 'mariadg@email.com', '+55 31 9999-9999', 'Aberto a partir das 19h', 15, 30, 3.5, 4.7, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/deliverys%2Fhotdogdamaria.jpg?alt=media&token=93d46c8d-abe3-4008-aa2d-c9a81a6c23fb', '', 'Rua dos Bororós', '629 ', '', 'Santa Mônica', 'Belo Horizonte', 'MG', -19.825318, -43.983096, '1', NULL),
(1017, 'Distribuidora Guarani Ltda (teste de cadastramento/validação)', 'FREE', 104, 'José Carlos dos Santos', 'ezequiasmartins@yahoo.com.br', '(31) 98410-7540', NULL, NULL, NULL, NULL, NULL, NULL, '31812-260', 'Rua Jornalista Laércio Campos', '417', 'Loja', 'Minaslândia', 'Belo Horizonte', 'MG', -19.847973, -43.930059, '1', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `extras`
--

CREATE TABLE `extras` (
  `EXTRA_ID` int NOT NULL,
  `DESCRICAO` varchar(100) NOT NULL,
  `VR_UNITARIO` float(9,2) NOT NULL,
  `DELIVERY_ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `extras`
--

INSERT INTO `extras` (`EXTRA_ID`, `DESCRICAO`, `VR_UNITARIO`, `DELIVERY_ID`) VALUES
(1, 'Carne Hamburger artezanal 120g', 2.50, 1002),
(2, 'Bacon Fatiado 50g', 3.50, 1002),
(3, 'Ovo (unidade)', 1.00, 1002),
(4, 'Mussarela', 1.50, 1002),
(5, 'Salada Americana', 1.00, 1002),
(6, 'Molho Especial 50g', 2.00, 1002),
(7, 'Molho Barbecue 50g', 3.00, 1002),
(14, 'Batata Palha', 0.50, 1003),
(15, 'Queijo tipo \"Requeijão Catupery\"', 1.50, 1003),
(16, 'Bacon fatiado', 1.50, 1003),
(17, 'Salada Americana (Alface Crespa, Tomate e Cebola Roxa)', 1.00, 1003),
(18, 'Molho Especial (Maionese, Alho, Salsa e Condimentos especiais)', 1.20, 1003);

-- --------------------------------------------------------

--
-- Table structure for table `itens`
--

CREATE TABLE `itens` (
  `ITEM_ID` int NOT NULL,
  `PEDIDO_ID` int NOT NULL,
  `PRODUTO_ID` int NOT NULL,
  `ACRESCIMOS` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `OBS` varchar(300) DEFAULT NULL,
  `QTD` float(9,2) DEFAULT NULL,
  `VR_UNITARIO` float(9,2) DEFAULT NULL,
  `VR_ACRESCIMOS` float(9,2) DEFAULT NULL,
  `TOTAL` float(9,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `itens`
--

INSERT INTO `itens` (`ITEM_ID`, `PEDIDO_ID`, `PRODUTO_ID`, `ACRESCIMOS`, `OBS`, `QTD`, `VR_UNITARIO`, `VR_ACRESCIMOS`, `TOTAL`) VALUES
(68, 1051, 1017, '[{\"DESCRICAO\": \"Mussarela\", \"VR_UNITARIO\": 1.5}, {\"DESCRICAO\": \"Salada Americana\", \"VR_UNITARIO\": 1}]', 'sendo um sem tomate', 2.00, 33.90, 2.50, 72.80),
(69, 1052, 1018, '[{\"DESCRICAO\": \"Molho Barbecue 50g\", \"VR_UNITARIO\": 3}]', '', 2.00, 24.90, 3.00, 55.80),
(70, 1052, 1025, '[]', '', 2.00, 4.99, 0.00, 9.98),
(71, 1053, 1017, '[{\"DESCRICAO\": \"Ovo (unidade)\", \"VR_UNITARIO\": 1}, {\"DESCRICAO\": \"Molho Barbecue 50g\", \"VR_UNITARIO\": 3}]', 'Sem batata palha', 2.00, 33.90, 4.00, 75.80),
(72, 1053, 1025, '[]', '', 2.00, 4.99, 0.00, 9.98),
(73, 1054, 1018, '[{\"DESCRICAO\": \"Salada Americana\", \"VR_UNITARIO\": 1}]', '', 3.00, 24.90, 1.00, 76.70),
(74, 1054, 1048, '[]', '', 2.00, 4.99, 0.00, 9.98),
(75, 1055, 1018, '[{\"DESCRICAO\": \"Molho Especial 50g\", \"VR_UNITARIO\": 2}, {\"DESCRICAO\": \"Ovo (unidade)\", \"VR_UNITARIO\": 1}]', 'Sem alface', 2.00, 24.90, 3.00, 55.80),
(76, 1055, 1025, '[]', '', 1.00, 4.99, 0.00, 4.99),
(84, 1059, 1018, '[{\"DESCRICAO\": \"Salada Americana\", \"VR_UNITARIO\": 1}, {\"DESCRICAO\": \"Molho Especial 50g\", \"VR_UNITARIO\": 2}]', 'Sem tomate', 1.00, 24.90, 3.00, 27.90),
(90, 1079, 1018, '[{\"DESCRICAO\": \"Molho Especial 50g\", \"VR_UNITARIO\": 2}]', 'Sem batata palha ', 2.00, 24.90, 2.00, 53.80),
(91, 1079, 1025, '[]', '', 1.00, 4.99, 0.00, 4.99),
(92, 1079, 1048, '[]', '', 1.00, 4.99, 0.00, 4.99),
(93, 1080, 1035, '[]', '', 4.00, 7.99, 0.00, 31.96),
(94, 1080, 1017, '[]', '', 2.00, 33.90, 0.00, 67.80),
(101, 1081, 1053, '[]', '', 1.00, 4.50, 0.00, 4.50),
(102, 1081, 1024, '[]', 'Sem batata palha por favor ', 1.00, 31.00, 0.00, 31.00),
(103, 1081, 1023, '[]', '', 1.00, 28.00, 0.00, 28.00),
(104, 1081, 1054, '[]', '', 1.00, 4.50, 0.00, 4.50),
(105, 1082, 1020, '[{\"DESCRICAO\": \"Carne Hamburger artezanal 120g\", \"VR_UNITARIO\": 2.5}, {\"DESCRICAO\": \"Molho Especial 50g\", \"VR_UNITARIO\": 2}, {\"DESCRICAO\": \"Salada Americana\", \"VR_UNITARIO\": 1}]', '', 2.00, NULL, 5.50, 62.20),
(106, 1082, 1025, '[]', '', 1.00, NULL, 0.00, 4.80),
(107, 1083, 1020, '[{\"DESCRICAO\": \"Carne Hamburger artezanal 120g\", \"VR_UNITARIO\": 2.5}, {\"DESCRICAO\": \"Salada Americana\", \"VR_UNITARIO\": 1}, {\"DESCRICAO\": \"Molho Especial 50g\", \"VR_UNITARIO\": 2}]', '', 1.00, NULL, 5.50, 31.10),
(108, 1084, 1070, '[{\"DESCRICAO\": \"Molho Especial 50g\", \"VR_UNITARIO\": 2}, {\"DESCRICAO\": \"Molho Barbecue 50g\", \"VR_UNITARIO\": 3}]', '', 1.00, NULL, 5.00, 40.00),
(109, 1084, 1069, '[]', '', 1.00, NULL, 0.00, 7.99),
(110, 1085, 1018, '[{\"DESCRICAO\": \"Molho Barbecue 50g\", \"VR_UNITARIO\": 3}]', 'O mesmo molho para ambos itens, porém um sem batata palha por favor ', 2.00, NULL, 3.00, 55.80),
(111, 1085, 1025, '[]', '', 2.00, NULL, 0.00, 9.60),
(112, 1086, 1022, '[]', '', 2.00, NULL, 0.00, 29.00),
(113, 1086, 1053, '[]', '', 1.00, NULL, 0.00, 4.50),
(114, 1086, 1054, '[]', '', 1.00, NULL, 0.00, 4.50),
(115, 1087, 1022, '[{\"EXTRA_ID\": 14, \"DESCRICAO\": \"Batata Palha\", \"DELIVERY_ID\": 1003, \"VR_UNITARIO\": 0.5}, {\"EXTRA_ID\": 15, \"DESCRICAO\": \"Queijo tipo \\\"Requeijão Catupery\\\"\", \"DELIVERY_ID\": 1003, \"VR_UNITARIO\": 1.5}, {\"EXTRA_ID\": 18, \"DESCRICAO\": \"Molho Especial (Maionese, Alho, Salsa e Condimentos especiais)\", \"DELIVERY_ID\": 1003, \"VR_UNITARIO\": 1.2}]', '', 2.00, 14.50, 3.20, 35.40),
(116, 1087, 1053, '[]', '', 2.00, 4.50, 0.00, 9.00),
(117, 1088, 1022, '[{\"EXTRA_ID\":14,\"DESCRICAO\":\"Batata Palha\",\"VR_UNITARIO\":0.5,\"DELIVERY_ID\":1003},{\"EXTRA_ID\":17,\"DESCRICAO\":\"Salada Americana (Alface Crespa, Tomate e Cebola Roxa)\",\"VR_UNITARIO\":1,\"DELIVERY_ID\":1003},{\"EXTRA_ID\":18,\"DESCRICAO\":\"Molho Especial (Maionese, Alho, Salsa e Condimentos especiais)\",\"VR_UNITARIO\":1.2,\"DELIVERY_ID\":1003}]', '', 1.00, 14.50, 2.70, 17.20),
(118, 1089, 1019, '[{\"EXTRA_ID\":7,\"DESCRICAO\":\"Molho Barbecue 50g\",\"VR_UNITARIO\":3,\"DELIVERY_ID\":1002},{\"EXTRA_ID\":5,\"DESCRICAO\":\"Salada Americana\",\"VR_UNITARIO\":1,\"DELIVERY_ID\":1002}]', '', 2.00, 27.90, 4.00, 63.80),
(119, 1090, 1018, '[{\"EXTRA_ID\":6,\"DESCRICAO\":\"Molho Especial 50g\",\"VR_UNITARIO\":2,\"DELIVERY_ID\":1002},{\"EXTRA_ID\":7,\"DESCRICAO\":\"Molho Barbecue 50g\",\"VR_UNITARIO\":3,\"DELIVERY_ID\":1002}]', 'Sem cebola ', 1.00, 24.90, 5.00, 29.90),
(120, 1090, 1025, '[]', '', 1.00, 4.80, 0.00, 4.80),
(121, 1091, 1018, '[{\"EXTRA_ID\":6,\"DESCRICAO\":\"Molho Especial 50g\",\"VR_UNITARIO\":2,\"DELIVERY_ID\":1002},{\"EXTRA_ID\":7,\"DESCRICAO\":\"Molho Barbecue 50g\",\"VR_UNITARIO\":3,\"DELIVERY_ID\":1002}]', 'Sem tomate ', 1.00, 24.90, 5.00, 29.90),
(122, 1091, 1025, '[]', '', 1.00, 4.80, 0.00, 4.80),
(123, 1092, 1018, '[{\"EXTRA_ID\":6,\"DESCRICAO\":\"Molho Especial 50g\",\"VR_UNITARIO\":2,\"DELIVERY_ID\":1002},{\"EXTRA_ID\":7,\"DESCRICAO\":\"Molho Barbecue 50g\",\"VR_UNITARIO\":3,\"DELIVERY_ID\":1002}]', 'Sem batata palha ', 2.00, 24.90, 5.00, 59.80),
(124, 1092, 1048, '[]', '', 1.00, 4.50, 0.00, 4.50),
(125, 1093, 1018, '[{\"EXTRA_ID\":6,\"DESCRICAO\":\"Molho Especial 50g\",\"VR_UNITARIO\":2,\"DELIVERY_ID\":1002},{\"EXTRA_ID\":5,\"DESCRICAO\":\"Salada Americana\",\"VR_UNITARIO\":1,\"DELIVERY_ID\":1002}]', 'Sem batata palha ', 2.00, 24.90, 3.00, 55.80),
(126, 1093, 1048, '[]', '', 2.00, 4.50, 0.00, 9.00),
(127, 1094, 1024, '[]', '', 1.00, 31.00, 0.00, 31.00),
(128, 1094, 1053, '[]', '', 1.00, 4.50, 0.00, 4.50),
(129, 1095, 1018, '[{\"EXTRA_ID\":5,\"DESCRICAO\":\"Salada Americana\",\"VR_UNITARIO\":1,\"DELIVERY_ID\":1002},{\"EXTRA_ID\":6,\"DESCRICAO\":\"Molho Especial 50g\",\"VR_UNITARIO\":2,\"DELIVERY_ID\":1002}]', 'Teste', 1.00, 24.90, 3.00, 27.90),
(130, 1096, 1070, '[{\"EXTRA_ID\":3,\"DESCRICAO\":\"Ovo (unidade)\",\"VR_UNITARIO\":1,\"DELIVERY_ID\":1002},{\"EXTRA_ID\":2,\"DESCRICAO\":\"Bacon Fatiado 50g\",\"VR_UNITARIO\":3.5,\"DELIVERY_ID\":1002}]', '', 1.00, 35.00, 4.50, 39.50),
(131, 1096, 1069, '[]', '', 2.00, 7.99, 0.00, 15.98),
(132, 1097, 1070, '[{\"EXTRA_ID\":2,\"DESCRICAO\":\"Bacon Fatiado 50g\",\"VR_UNITARIO\":3.5,\"DELIVERY_ID\":1002},{\"EXTRA_ID\":3,\"DESCRICAO\":\"Ovo (unidade)\",\"VR_UNITARIO\":1,\"DELIVERY_ID\":1002}]', '', 2.00, 35.00, 4.50, 79.00),
(133, 1097, 1048, '[]', '', 1.00, 4.50, 0.00, 4.50),
(134, 1097, 1025, '[]', '', 1.00, 4.80, 0.00, 4.80);

-- --------------------------------------------------------

--
-- Table structure for table `pedidos`
--

CREATE TABLE `pedidos` (
  `PEDIDO_ID` int NOT NULL,
  `DELIVERY_ID` int DEFAULT NULL,
  `USER_ID` int DEFAULT NULL,
  `DATA` datetime DEFAULT NULL,
  `ENDERECO_ENTREGA` varchar(100) NOT NULL,
  `LATITUDE` decimal(11,8) NOT NULL,
  `LONGITUDE` decimal(11,8) NOT NULL,
  `VR_SUBTOTAL` float(9,2) DEFAULT NULL,
  `TAXA_ENTREGA` float(9,2) DEFAULT NULL,
  `VR_TOTAL` float(9,2) DEFAULT NULL,
  `STATUS` enum('NOVO','AGUARDANDO','PREPARANDO','PRONTO_PARA_RETIRADA','SAIU_PARA_ENTREGA','ENTREGUE','PGTO_PENDENTE','PGTO_OK','FINALIZADO','CANCELADO') DEFAULT NULL,
  `PUSH_TOKEN` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `pedidos`
--

INSERT INTO `pedidos` (`PEDIDO_ID`, `DELIVERY_ID`, `USER_ID`, `DATA`, `ENDERECO_ENTREGA`, `LATITUDE`, `LONGITUDE`, `VR_SUBTOTAL`, `TAXA_ENTREGA`, `VR_TOTAL`, `STATUS`, `PUSH_TOKEN`) VALUES
(1051, 1002, 100001, '2025-03-20 18:42:05', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250  ', -19.82724000, -43.98316000, 72.80, 4.00, 76.80, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1052, 1002, 100001, '2025-03-20 18:59:01', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250 ', -19.82724000, -43.98316000, 65.78, 4.00, 69.78, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1053, 1002, 100001, '2025-03-20 21:37:15', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250 ', -19.82724000, -43.98316000, 85.78, 4.00, 89.78, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1054, 1002, 100001, '2025-03-20 22:34:24', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250 ', -19.82724000, -43.98316000, 86.68, 4.00, 90.68, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1055, 1002, 100001, '2025-03-20 15:58:12', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250 ', -19.82724000, -43.98316000, 60.79, 4.00, 64.79, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1059, 1002, 100001, '2025-03-21 21:16:44', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250 ', -19.82724000, -43.98316000, 27.90, 4.00, 31.90, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1079, 1002, 100001, '2025-04-03 17:58:50', 'Rua Alcides Lins, 320, Venda Nova, 31510-030\r\n\r\n', -19.81641497, -43.95921010, 63.78, 4.00, 67.78, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1080, 1002, 100001, '2025-04-22 00:16:25', 'Rua dos Apaches, 870, Santa Monica, 31530-280', -19.82729230, -43.98321370, 99.76, 4.00, 103.76, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1081, 1003, 100001, '2025-05-01 15:42:09', 'Rua dos Comanches, 870, Santa Monica, 31530-250', -19.82725810, -43.98318010, 68.00, 3.50, 71.50, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1082, 1002, NULL, '2025-09-24 21:11:14', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250', -19.82724370, -43.98307500, 67.00, 4.00, 71.00, 'NOVO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1083, 1002, 100001, '2025-09-24 21:31:13', 'Rua dos Apaches, 870, Santa Monica, 31530-280', -19.82726050, -43.98317840, 31.10, 4.00, 35.10, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1084, 1002, 100001, '2025-09-25 21:08:37', 'Rua dos Comanches, 870, Apto 302, Santa Monica, 31530-250', -19.82719110, -43.98311470, 47.99, 4.00, 51.99, 'NOVO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1085, 1002, 100001, '2025-09-26 15:26:05', 'Rua dos Comanches, 870, Apto 302, Santa Monica, 31530-250', -19.82732730, -43.98320140, 65.40, 4.00, 69.40, 'NOVO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1086, 1003, 100001, '2025-09-26 15:30:52', 'Rua dos Comanches, 870, Apto 302 Santa Monica, 31530-250', -19.82722320, -43.98310900, 38.00, 3.50, 41.50, 'NOVO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1087, 1003, 100001, '2025-10-03 15:20:42', 'Rua dos Comanches, 860, Santa Monica, Minas Gerais, 31530-250', -19.82721790, -43.98304120, 44.40, 3.50, 47.90, 'NOVO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1088, 1003, 100001, '2025-10-08 22:18:02', 'Rua dos Apaches, 870, Santa Monica, Minas Gerais, 31530-280', -19.82721040, -43.98311450, 17.20, 3.50, 20.70, 'NOVO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1089, 1002, 100001, '2025-10-14 00:30:16', 'Rua dos Comanches, 860, Santa Monica, Minas Gerais, 31530-250', -19.82720700, -43.98306120, 63.80, 4.00, 67.80, 'FINALIZADO', 'ExponentPushToken[Tm8QY1ASWNUDghDleCM3ez]'),
(1090, 1002, 100001, '2025-11-08 13:34:02', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82718320, -43.98302290, 34.70, 4.00, 38.70, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1091, 1002, 100001, '2025-11-08 20:51:50', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82718440, -43.98302610, 34.70, 4.00, 38.70, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1092, 1002, 100001, '2025-11-08 20:59:14', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82723910, -43.98306780, 64.30, 4.00, 68.30, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1093, 1002, 100001, '2025-11-09 14:20:33', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82723770, -43.98304270, 64.80, 4.00, 68.80, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1094, 1003, 100001, '2025-11-09 14:27:16', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82715950, -43.98311440, 35.50, 3.50, 39.00, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1095, 1002, 100001, '2025-11-09 20:29:46', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82723280, -43.98302300, 27.90, 4.00, 31.90, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1096, 1002, 100001, '2025-11-12 20:30:19', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82720280, -43.98302970, 55.48, 4.00, 59.48, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]'),
(1097, 1002, 100001, '2025-12-01 08:50:46', 'Rua Alcídes Lins, 320, Venda Nova, Minas Gerais, 31510-030', -19.81642560, -43.95922110, 88.30, 4.00, 92.30, 'FINALIZADO', 'ExponentPushToken[NORKdoBG3OuOFfyf3Ma6i3]');

-- --------------------------------------------------------

--
-- Table structure for table `pix_transactions`
--

CREATE TABLE `pix_transactions` (
  `id` int NOT NULL,
  `orderId` varchar(50) NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `status` varchar(20) NOT NULL,
  `txid` varchar(50) NOT NULL,
  `payload` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `pix_transactions`
--

INSERT INTO `pix_transactions` (`id`, `orderId`, `value`, `status`, `txid`, `payload`, `created_at`, `updated_at`) VALUES
(1, '1079', 67.78, 'GENERATED', 'PSI00001079', '00020126470014br.gov.bcb.pix0125ezequiasmartins@gmail.com520400005303986540567.785802BR5912PSI-DELIVERY6014BELO HORIZONTE62150511PSI0000107963049401', '2025-04-19 19:26:52', '2025-04-21 23:48:19'),
(3, '1059', 31.90, 'GENERATED', 'PSI00001059', '00020126470014br.gov.bcb.pix0125ezequiasmartins@gmail.com520400005303986540531.905802BR5912PSI-DELIVERY6014BELO HORIZONTE62150511PSI000010596304DFFC', '2025-04-19 19:55:56', '2025-04-19 19:55:56'),
(5, '1080', 103.76, 'GENERATED', 'PSI00001080', '00020126470014br.gov.bcb.pix0125ezequiasmartins@gmail.com5204000053039865406103.765802BR5912PSI-SOFTWARE6015BELO HORIZONTE 62150511PSI000010806304D2E1', '2025-04-24 16:04:21', '2025-05-01 15:15:30'),
(6, '1081', 65.50, 'GENERATED', 'PSI00001081', '00020126470014br.gov.bcb.pix0125ezequiasmartins@gmail.com520400005303986540565.505802BR5912PSI-SOFTWARE6015BELO HORIZONTE 62150511PSI0000108163041D29', '2025-04-25 18:31:19', '2025-04-25 18:31:19'),
(7, '1083', 35.10, 'GENERATED', 'PSI00001083', '00020126470014br.gov.bcb.pix0125ezequiasmartins@gmail.com520400005303986540535.105802BR5912PSI-SOFTWARE6015BELO HORIZONTE 62150511PSI0000108363048BAB', '2025-09-24 21:39:48', '2025-09-24 21:39:48'),
(8, '1084', 51.99, 'GENERATED', 'PSI00001084', '00020126470014br.gov.bcb.pix0125ezequiasmartins@gmail.com520400005303986540551.995802BR5912PSI-SOFTWARE6015BELO HORIZONTE 62150511PSI0000108463049E26', '2025-09-25 21:10:59', '2025-09-25 21:11:00'),
(9, '1085', 69.40, 'GENERATED', 'PSI00001085', '00020126470014br.gov.bcb.pix0125ezequiasmartins@gmail.com520400005303986540569.405802BR5912PSI-SOFTWARE6015BELO HORIZONTE 62150511PSI000010856304F4F5', '2025-09-26 15:43:16', '2025-09-26 15:43:16'),
(10, '1087', 47.90, 'GENERATED', 'PSI00001087', '00020126470014br.gov.bcb.pix0125ezequiasmartins@gmail.com520400005303986540547.905802BR5912PSI-SOFTWARE6015BELO HORIZONTE 62150511PSI0000108763040397', '2025-10-03 15:29:21', '2025-10-03 15:29:22'),
(11, '1088', 20.70, 'GENERATED', 'PSI00001088', '00020126450014br.gov.bcb.pix0123agenciamarka7@gmail.com520400005303986540520.705802BR5924MARKA GESTÃO DE PRODUTOS6014LAGOA SANTA MG62150511PSI000010886304C800', '2025-10-09 21:19:49', '2025-10-09 21:19:49'),
(12, '1091', 38.70, 'GENERATED', 'PSI00001091', '00020126330014br.gov.bcb.pix011173209341672520400005303986540538.705802BR5918DELIVERYBAIRRO.COM6015BELO HORIZONTE 62150511PSI0000109163046C0F', '2025-11-08 20:52:19', '2025-11-08 20:52:19'),
(13, '1092', 68.30, 'GENERATED', 'PSI00001092', '00020126330014br.gov.bcb.pix011173209341672520400005303986540568.305802BR5918DELIVERYBAIRRO.COM6015BELO HORIZONTE 62150511PSI0000109263040778', '2025-11-08 21:01:05', '2025-11-08 21:01:05'),
(14, '1095', 31.90, 'GENERATED', 'PSI00001095', '00020126330014br.gov.bcb.pix011173209341672520400005303986540531.905802BR5918DELIVERYBAIRRO.COM6015BELO HORIZONTE 62150511PSI00001095630427A3', '2025-11-12 15:08:19', '2025-11-12 15:08:19'),
(15, '1094', 39.00, 'GENERATED', 'PSI00001094', '00020126330014br.gov.bcb.pix011173209341672520400005303986540539.005802BR5918DELIVERYBAIRRO.COM6015BELO HORIZONTE 62150511PSI00001094630453D4', '2025-11-12 17:42:55', '2025-11-12 17:42:55'),
(16, '1097', 92.30, 'GENERATED', 'PSI00001097', '00020126330014br.gov.bcb.pix011173209341672520400005303986540592.305802BR5918DELIVERYBAIRRO.COM6015BELO HORIZONTE 62150511PSI0000109763043E7E', '2025-12-01 08:51:33', '2025-12-01 08:51:33');

-- --------------------------------------------------------

--
-- Table structure for table `produtos`
--

CREATE TABLE `produtos` (
  `PRODUTO_ID` int NOT NULL,
  `DELIVERY_ID` int NOT NULL,
  `PRODUTO_NOME` varchar(100) DEFAULT NULL,
  `DESCRICAO` varchar(1000) DEFAULT NULL,
  `VR_UNITARIO` float(9,2) DEFAULT NULL,
  `URL_IMAGEM` varchar(240) DEFAULT NULL,
  `ITENS_EXTRAS` varchar(1) NOT NULL,
  `ITENS_OBS` varchar(1) NOT NULL,
  `CHV` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `produtos`
--

INSERT INTO `produtos` (`PRODUTO_ID`, `DELIVERY_ID`, `PRODUTO_NOME`, `DESCRICAO`, `VR_UNITARIO`, `URL_IMAGEM`, `ITENS_EXTRAS`, `ITENS_OBS`, `CHV`) VALUES
(1017, 1002, 'X-Tudo', 'Pão, hambúrguer de carne angus, alface, tomate e queijo prato.', 33.90, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Fx-cebola-maionese.jpg?alt=media&token=5c279940-5b42-4107-8467-5462189b367b', 'S', 'S', ''),
(1018, 1002, 'X-Egg Bacon', 'Pão, hambúrguer de carne angus, creme cheese, queijo prato, bacon e ovo.', 24.90, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Fx-eggbacon.jpg?alt=media&token=c4dfa87f-d48c-4559-8f1b-accf16512b28', 'S', 'S', ''),
(1019, 1002, 'X-Bacon Duplo', 'Pão, 02 hambúrguers de carne angus, salada, queijo prato e bacon.', 27.90, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Fxbacon-duplo.jpg?alt=media&token=48f0e6a0-8536-497b-8803-bea76992a583', 'S', 'S', ''),
(1020, 1002, 'X-Filé Frango', 'Pão, filet de frango picado, creme cheese e queijo prato.', 25.60, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Fx-frango.png?alt=media&token=4c7f5bfa-dcd8-4bed-a5db-6e982a0c7ea5', 'S', 'S', ''),
(1022, 1003, 'Hot Dog Tradicional', 'Pão de Hot Dog, 1 Salsicha, Ketchup, Maionese e Mostarda', 14.50, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Fhotdog-1.png?alt=media&token=63055b8f-b826-4f23-9348-0649a92c0738', 'S', 'S', ''),
(1023, 1003, 'Hot Dog Soja', 'Salsicha de soja, requeijão, oregano, cheddar, vinagrete, milho, maionese, batata palha, pure e parmesão (vegetariano ou vegano)', 28.00, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Fhotdog-2.png?alt=media&token=a4556ff9-6e61-465e-9a1a-3482cea3e6e0', 'S', 'S', ''),
(1024, 1003, 'Hot Dogão', 'Duas salsichas, requeijão, oregano, cheddar, vinagrete, milho, maionese, batata palha, pure e parmesão', 31.00, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Fhotdog-3.png?alt=media&token=00a92e27-fa0e-4ff8-b359-d87e3d5912d6', 'S', 'S', ''),
(1025, 1002, 'Coca-Cola Lata', 'Refrigerante Coca-Cola lata 350ml', 4.80, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Fcoca-cola.jpg?alt=media&token=55f1a7a2-8550-4d42-80f5-b6331e593462', 'N', 'N', ''),
(1030, 1001, 'Porção de Fritas + Frango a Passarinho', '300g de Batata Frita a Palito + 300g de Frango Frito a Passarinho + Salada (opcional)', 45.00, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Ffrango%20a%20passarinho%20%2B%20fritas.jpg?alt=media&token=b56f9fb2-0cd8-4d16-9af3-22a2bd9c4912', 'S', 'S', ''),
(1032, 1001, 'Porção de Frango a Passarinho', '600g de Frango Frito a Passarinho + Salada Americana (opcional)', 38.00, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Ffrango%20a%20passarinho.jpg?alt=media&token=8b81e72c-2657-49e2-8c71-12052282fced', 'S', 'S', ''),
(1039, 1001, 'Mexidão', 'Arroz, feijão, farofa c/ ovos mexido, calabresa acebolada, ovo frito, bacon', 15.00, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Fmexid%C3%A3o.png?alt=media&token=d2794d1a-367a-42d6-89df-1b10d0ec37e8', 'S', 'S', ''),
(1040, 1001, 'Espaguete a Bolonhesa', 'Espaguete ao molho Bolonhesa c/ Mussarella', 18.00, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Fespaguete-bolonhesa.png?alt=media&token=665e0aa5-9619-4acc-a8c4-b84194760ff4', 'S', 'S', ''),
(1041, 1001, 'Janta', 'A escolha, pernil, frango, omelete, arroz feijão espaguete fritas', 15.00, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Fjanta.png?alt=media&token=e74ef0b5-8875-4f7f-abd6-34efddb9358e', 'S', 'S', ''),
(1048, 1002, 'Guaraná Antárctica Lata', 'Refrigerante de Guaraná, Lata 350ml', 4.50, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2Fguaran%C3%A1%20antarctica.jpg?alt=media&token=96b03d8a-3b04-4eb6-8329-6c3844ccc2cd', 'N', 'N', ''),
(1053, 1003, 'Guaraná Antártica 350ml', 'Refrigerante de Guaraná, Lata 350ml', 4.50, 'https://firebasestorage.googleapis.com/v0/b/psi-deliverybairro.firebasestorage.app/o/produtos%2Fguaran%C3%A1%20antarctica.jpg?alt=media&token=70dde331-657d-47ad-b2b1-ee2322747aef', 'N', 'N', ''),
(1054, 1003, 'Coca-Cola 350ml', 'Refrigerante de Cola, Lata 350ml', 4.50, 'https://firebasestorage.googleapis.com/v0/b/psi-deliverybairro.firebasestorage.app/o/produtos%2Fcoca-cola.jpg?alt=media&token=4b9f601d-658e-4be7-a5b3-52157be62045', 'N', 'N', ''),
(1057, 1001, 'Água Mineral s/ Gás', 'Água Mineral sem Gás, copo 200ml', 2.00, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2F%C3%81GUA%20MINERAL%20SEM%20G%C3%81S%20200ML.jpg?alt=media&token=abc0d91a-ee07-4844-a4e1-a5cc29b07741', 'N', 'N', ''),
(1058, 1001, 'Água Mineral c/ Gás', 'Água Mineral com Gás Natural, garrafa 300ml', 2.80, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2F%C3%81GUA%20MINERAL%20GASOSA.jpg?alt=media&token=fa672ffa-6fe3-4786-bbe8-80db63cf1dea', 'N', 'N', ''),
(1061, 1001, 'Refrigerante Coca-Cola 350ml', 'Refrigerante de Cola, Lata 350ml', 4.80, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2FCOCA-COLA.jpg?alt=media&token=bb15e4ec-18d9-4439-861f-064a623394b6', 'N', 'N', ''),
(1062, 1001, 'Refrigerante Guaraná Antártica 350ml', 'Refrigerante de Guaraná, Lata 350ml', 4.80, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2FGUARAN%C3%81%20ANTARCTICA%20350%20ML.jpg?alt=media&token=89db11b1-2ad1-4026-9913-1fda702d8ef3', 'N', 'N', ''),
(1063, 1001, 'Cerveja Brahma 350ml', 'Cerveja Brahma Chopp Lata 350ml', 7.59, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/produtos%2FCERVEJA%20BRAHMA%20LATA.jpg?alt=media&token=1ab1d965-a44b-4eae-8086-45bd20b07787', 'N', 'N', ''),
(1068, 1002, 'Água Mineral Gasosa 300ml', 'Água Mineral c/ Gás Natural\nGarrafa c/ 300ml', 4.80, 'https://firebasestorage.googleapis.com/v0/b/psi-deliverybairro.firebasestorage.app/o/produtos%2F%C3%81GUA%20MINERAL%20GASOSA.jpg?alt=media&token=81e61c8b-19b8-4713-b079-2893a27d719b', 'S', 'S', ''),
(1069, 1002, 'Cerveja Brahma Lata 355ml', 'Cerveja Brahma Chopp Lata 355ml', 7.99, 'https://firebasestorage.googleapis.com/v0/b/psi-deliverybairro.firebasestorage.app/o/produtos%2Fcerveja%20brahma.jpg?alt=media&token=293ae99f-d010-46cb-bc2d-fcca6a2e342c', 'N', 'N', ''),
(1070, 1002, 'X-Burguer Gourmet', 'Carne de Hamburguer Especial 200gr Grelhado,\nAlface, Rúcula, Cebola Roxa, Tomate, Queijo Cheddar, Pão Especial', 35.00, 'https://firebasestorage.googleapis.com/v0/b/psi-deliverybairro.firebasestorage.app/o/produtos%2Fhamburguer-artezanal.jpg?alt=media&token=a2d0077f-f46a-49fd-bcda-c3709262fa78', 'S', 'S', '');

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `LOG_ID` int NOT NULL,
  `ADMIN_ID` int DEFAULT NULL,
  `ACTION` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ENTITY_TYPE` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ENTITY_ID` int DEFAULT NULL,
  `DETAILS` text COLLATE utf8mb4_unicode_ci,
  `IP_ADDRESS` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `USER_AGENT` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taxa`
--

CREATE TABLE `taxa` (
  `TAXA_ID` int NOT NULL,
  `DELIVERY_ID` int NOT NULL,
  `TAXA_ENTREGA` float(9,2) DEFAULT NULL,
  `CHV` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `taxa`
--

INSERT INTO `taxa` (`TAXA_ID`, `DELIVERY_ID`, `TAXA_ENTREGA`, `CHV`) VALUES
(1, 1001, 5.50, 'A'),
(2, 1002, 6.50, 'A'),
(3, 1003, 5.75, 'A');

-- --------------------------------------------------------

--
-- Table structure for table `taxas_config`
--

CREATE TABLE `taxas_config` (
  `CONFIG_ID` int NOT NULL,
  `TAXA_SERVICO` decimal(10,2) NOT NULL DEFAULT '0.99',
  `TAXA_SERVICO_ATIVA` tinyint(1) DEFAULT '1',
  `PSP_PROVIDER` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'PagSeguro',
  `TAXA_PAGAMENTO_FIXA` decimal(10,2) NOT NULL DEFAULT '0.40',
  `TAXA_PAGAMENTO_PERCENTUAL` decimal(5,2) NOT NULL DEFAULT '3.99',
  `TAXA_PAGAMENTO_MIN` decimal(5,2) NOT NULL DEFAULT '3.99',
  `TAXA_PAGAMENTO_MAX` decimal(5,2) NOT NULL DEFAULT '4.99',
  `TAXA_PAGAMENTO_ATIVA` tinyint(1) DEFAULT '1',
  `UPDATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `UPDATED_BY` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `taxas_config`
--

INSERT INTO `taxas_config` (`CONFIG_ID`, `TAXA_SERVICO`, `TAXA_SERVICO_ATIVA`, `PSP_PROVIDER`, `TAXA_PAGAMENTO_FIXA`, `TAXA_PAGAMENTO_PERCENTUAL`, `TAXA_PAGAMENTO_MIN`, `TAXA_PAGAMENTO_MAX`, `TAXA_PAGAMENTO_ATIVA`, `UPDATED_AT`, `UPDATED_BY`) VALUES
(1, 0.99, 1, 'PagSeguro', 0.40, 3.99, 3.99, 4.99, 1, '2025-12-03 13:56:03', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `taxas_config_history`
--

CREATE TABLE `taxas_config_history` (
  `HISTORY_ID` int NOT NULL,
  `TAXA_SERVICO` decimal(10,2) DEFAULT NULL,
  `TAXA_PAGAMENTO_FIXA` decimal(10,2) DEFAULT NULL,
  `TAXA_PAGAMENTO_PERCENTUAL` decimal(5,2) DEFAULT NULL,
  `PSP_PROVIDER` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CHANGED_BY` int DEFAULT NULL,
  `CHANGED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `REASON` text COLLATE utf8mb4_unicode_ci,
  `OLD_VALUES` text COLLATE utf8mb4_unicode_ci,
  `NEW_VALUES` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taxas_exceptions`
--

CREATE TABLE `taxas_exceptions` (
  `EXCEPTION_ID` int NOT NULL,
  `DELIVERY_ID` int NOT NULL,
  `TAXA_SERVICO_CUSTOM` decimal(10,2) DEFAULT NULL,
  `TAXA_PAGAMENTO_FIXA_CUSTOM` decimal(10,2) DEFAULT NULL,
  `TAXA_PAGAMENTO_PERCENTUAL_CUSTOM` decimal(5,2) DEFAULT NULL,
  `REASON` text COLLATE utf8mb4_unicode_ci,
  `ACTIVE` tinyint(1) DEFAULT '1',
  `CREATED_AT` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CREATED_BY` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `userlog`
--

CREATE TABLE `userlog` (
  `ID` int NOT NULL,
  `USER_ID` int NOT NULL,
  `IP_ADDRESS` varchar(45) NOT NULL,
  `DT_ACCESS` datetime NOT NULL,
  `TOKEN` varchar(240) NOT NULL,
  `EXPIRATION_TIME` datetime DEFAULT NULL,
  `CHV` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `userlog`
--

INSERT INTO `userlog` (`ID`, `USER_ID`, `IP_ADDRESS`, `DT_ACCESS`, `TOKEN`, `EXPIRATION_TIME`, `CHV`) VALUES
(1, 100001, '::ffff:192.168.0.3', '2025-11-12 17:14:35', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDE3OjE0OjM1IiwiY2h2IjoxLCJpYXQiOjE3NjI5Nzg0NzUsImV4cCI6MTc2Mjk4OTI3NX0.qALbsiIerh9ScuxV1nIhKxlOLV50njPc2AFtkHBQMhg', '2025-11-12 20:14:35', '1'),
(2, 100001, '::ffff:192.168.0.3', '2025-11-12 17:30:47', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDE3OjMwOjQ3IiwiY2h2IjoxLCJpYXQiOjE3NjI5Nzk0NDcsImV4cCI6MTc2Mjk5MDI0N30.O-S1iNFLZ-qXcKxVRTVF9-kUfyOTYVTEyc2PIhE7fYI', '2025-11-12 20:30:47', '1'),
(3, 100001, '::ffff:192.168.0.3', '2025-11-12 17:31:26', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDE3OjMxOjI2IiwiY2h2IjoxLCJpYXQiOjE3NjI5Nzk0ODYsImV4cCI6MTc2Mjk5MDI4Nn0.dQUjCV13Gz1cfSepC8_aEF_CgnvT-8j3JdqyyU8vKzQ', '2025-11-12 20:31:26', '1'),
(4, 100001, '::ffff:192.168.0.3', '2025-11-12 17:52:20', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDE3OjUyOjIwIiwiY2h2IjoxLCJpYXQiOjE3NjI5ODA3NDAsImV4cCI6MTc2Mjk5MTU0MH0.GjXEFMzhKeakRCY5WeBqiU99EYhzqIb7xgTaKlFaTbg', '2025-11-12 20:52:20', '1'),
(5, 100001, '::ffff:192.168.0.3', '2025-11-12 18:41:10', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDE4OjQxOjEwIiwiY2h2IjoxLCJpYXQiOjE3NjI5ODM2NzAsImV4cCI6MTc2Mjk5NDQ3MH0.WHGhPrl9OInAfgWnN2tri2J5HsAuG6oBB34oV0hc5dk', '2025-11-12 21:41:10', '1'),
(6, 100001, '::ffff:192.168.0.3', '2025-11-12 18:42:33', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDE4OjQyOjMzIiwiY2h2IjoxLCJpYXQiOjE3NjI5ODM3NTMsImV4cCI6MTc2Mjk5NDU1M30.IYZH0QxCsZzWwS-8nvB8t_apOD5vLjoXrJsmYyg-PEw', '2025-11-12 21:42:33', '1'),
(7, 100001, '::ffff:192.168.0.3', '2025-11-12 19:06:17', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDE5OjA2OjE3IiwiY2h2IjoxLCJpYXQiOjE3NjI5ODUxNzcsImV4cCI6MTc2Mjk5NTk3N30.rv7g_cJwb7NbEU2o7SYeuaPUZiOACQbK14I3g65VUc4', '2025-11-12 22:06:17', '1'),
(8, 100001, '::ffff:192.168.0.3', '2025-11-12 19:38:12', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDE5OjM4OjEyIiwiY2h2IjoxLCJpYXQiOjE3NjI5ODcwOTIsImV4cCI6MTc2Mjk5Nzg5Mn0.pMhILPCJZj2LQjKic0QW24VXL12JshfXYOhpcW9VNMQ', '2025-11-12 22:38:12', '1'),
(9, 100001, '::ffff:192.168.0.3', '2025-11-12 19:38:16', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDE5OjM4OjE2IiwiY2h2IjoxLCJpYXQiOjE3NjI5ODcwOTYsImV4cCI6MTc2Mjk5Nzg5Nn0._Hbsqb_A3mm4nzUTy6QWNlcLcR0ClMrI06MS3y7364E', '2025-11-12 22:38:16', '1'),
(10, 100001, '::ffff:192.168.0.3', '2025-11-12 19:38:28', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDE5OjM4OjI4IiwiY2h2IjoxLCJpYXQiOjE3NjI5ODcxMDgsImV4cCI6MTc2Mjk5NzkwOH0.hoeOLRIbY7DG3Oz3Psth1hy97P3VGwvM0y6XWZif074', '2025-11-12 22:38:28', '1'),
(11, 100001, '::ffff:192.168.0.3', '2025-11-12 19:45:26', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDE5OjQ1OjI2IiwiY2h2IjoxLCJpYXQiOjE3NjI5ODc1MjYsImV4cCI6MTc2Mjk5ODMyNn0.7TmWBw8zDGZJGEd0hjtRVpbLA2k6oxQlgrRsNNFOXAo', '2025-11-12 22:45:26', '1'),
(12, 100001, '::ffff:192.168.0.3', '2025-11-12 19:46:57', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDE5OjQ2OjU3IiwiY2h2IjoxLCJpYXQiOjE3NjI5ODc2MTcsImV4cCI6MTc2Mjk5ODQxN30.Bwxu4cYBgyilFGdfXzWjAh0bdBLQPEcn5JhsFHxULKM', '2025-11-12 22:46:57', '1'),
(13, 100001, '::ffff:192.168.0.3', '2025-11-12 20:18:29', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDIwOjE4OjI5IiwiY2h2IjoxLCJpYXQiOjE3NjI5ODk1MDksImV4cCI6MTc2MzAwMDMwOX0.1vBDO_fXq1jx6jtjuwxjDTYW3XJXvXWqL9Ca1d5_iCo', '2025-11-12 23:18:29', '1'),
(14, 100001, '::ffff:192.168.0.3', '2025-11-12 20:29:08', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDIwOjI5OjA4IiwiY2h2IjoxLCJpYXQiOjE3NjI5OTAxNDgsImV4cCI6MTc2MzAwMDk0OH0.vXKuC3VGjpHLEVN5PzqHWGLS0_6psYe8UpT-9UoSUBg', '2025-11-12 23:29:08', '1'),
(15, 100001, '::ffff:192.168.0.3', '2025-11-12 20:31:03', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTEyIDIwOjMxOjAzIiwiY2h2IjoxLCJpYXQiOjE3NjI5OTAyNjMsImV4cCI6MTc2MzAwMTA2M30.-yvj3V6YmOXVxbHwjPH9Np5h4n3qozC96ZZNxeh6jEw', '2025-11-12 23:31:03', '1'),
(16, 200002, '::ffff:192.168.0.3', '2025-11-15 18:14:25', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjAwMDAyLCJ0eXBlIjoiY291cmllciIsImR0X2FjY2VzcyI6IjIwMjUtMTEtMTUgMTg6MTQ6MjUiLCJjaHYiOjEsImlhdCI6MTc2MzI0MTI2NSwiZXhwIjoxNzYzMjUyMDY1fQ.wd65Dc_-e2OC3vOwV67Dz5T4NmjwjfXLn-_1WgKQSlY', '2025-11-15 21:14:25', '1'),
(17, 1002, '::1', '2025-11-17 13:34:19', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xNyAxMzozNDoxOSIsImNodiI6MSwiaWF0IjoxNzYzMzk3MjU5LCJleHAiOjE3NjM0MDgwNTl9.eVyhelCFXpNJFi_-_Lz8Ktoc-kk5pVVYQhnqHnWwNMA', '2025-11-17 16:34:19', '1'),
(18, 1002, '::1', '2025-11-17 14:03:15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xNyAxNDowMzoxNSIsImNodiI6MSwiaWF0IjoxNzYzMzk4OTk1LCJleHAiOjE3NjM0MDk3OTV9.mD6ZoZhiVWLOZ9TPyNi2hhCs6At9xzgI9ICDB0pLmC0', '2025-11-17 17:03:15', '1'),
(19, 1002, '::1', '2025-11-17 14:20:23', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xNyAxNDoyMDoyMyIsImNodiI6MSwiaWF0IjoxNzYzNDAwMDIzLCJleHAiOjE3NjM0MTA4MjN9.D1LoOkRBydXY5Z7nCj3gUEi5-m1bP0SisxlPBAjLdo8', '2025-11-17 17:20:23', '1'),
(20, 1002, '::1', '2025-11-17 14:43:36', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xNyAxNDo0MzozNiIsImNodiI6MSwiaWF0IjoxNzYzNDAxNDE2LCJleHAiOjE3NjM0MTIyMTZ9.f89QykYlU7bioIeUzUYdITpsyf33OU6n02hohxyrzvY', '2025-11-17 17:43:36', '1'),
(21, 1002, '::1', '2025-11-17 14:59:15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xNyAxNDo1OToxNSIsImNodiI6MSwiaWF0IjoxNzYzNDAyMzU1LCJleHAiOjE3NjM0MTMxNTV9.WGkPiqgD608_x5O3Wac1rR27CZpB2BhzxX6Kn5lln10', '2025-11-17 17:59:15', '1'),
(22, 1002, '::1', '2025-11-17 14:59:44', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xNyAxNDo1OTo0NCIsImNodiI6MSwiaWF0IjoxNzYzNDAyMzg0LCJleHAiOjE3NjM0MTMxODR9.oXq944TyhtrVEtALam1qLtAawp0AFpwjQeg3zzo9egA', '2025-11-17 17:59:44', '1'),
(23, 1002, '::1', '2025-11-17 15:02:54', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xNyAxNTowMjo1NCIsImNodiI6MSwiaWF0IjoxNzYzNDAyNTc0LCJleHAiOjE3NjM0MTMzNzR9.Qn1ofxvaNTzceHE96SYllPVChU3WJWahiJP_JtsRvVE', '2025-11-17 18:02:54', '1'),
(24, 100001, '::ffff:192.168.0.3', '2025-11-17 18:12:39', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTE3IDE4OjEyOjM5IiwiY2h2IjoxLCJpYXQiOjE3NjM0MTM5NTksImV4cCI6MTc2MzQyNDc1OX0.KDtMpABmW8TvBW4fqGT82tpFjFiesG471nuvogUTpTE', '2025-11-17 21:12:39', '1'),
(25, 1002, '::1', '2025-11-19 14:32:06', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xOSAxNDozMjowNiIsImNodiI6MSwiaWF0IjoxNzYzNTczNTI2LCJleHAiOjE3NjM1ODQzMjZ9.OX17LLycUtuznDg9CS4qY8bEKe_oKNApIpXANxMSjGk', '2025-11-19 17:32:06', '1'),
(26, 1002, '::1', '2025-11-19 14:32:45', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xOSAxNDozMjo0NSIsImNodiI6MSwiaWF0IjoxNzYzNTczNTY1LCJleHAiOjE3NjM1ODQzNjV9.y3uwh2DfvrhFgtEKiLiZGhSgBf-kqI09BzX_xYgarkA', '2025-11-19 17:32:45', '1'),
(27, 1002, '::1', '2025-11-19 14:49:52', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xOSAxNDo0OTo1MiIsImNodiI6MSwiaWF0IjoxNzYzNTc0NTkyLCJleHAiOjE3NjM1ODUzOTJ9.ZVp86LsNsJ-5cJkJGSpaR1Z0qzYNoQshfJCHeuDvrRs', '2025-11-19 17:49:52', '1'),
(28, 1002, '::1', '2025-11-19 15:22:44', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xOSAxNToyMjo0NCIsImNodiI6MSwiaWF0IjoxNzYzNTc2NTY0LCJleHAiOjE3NjM1ODczNjR9.eGSFcWdpLnPIJ1RPPa_dYqBRIyInmbaAVJRDHdJAubk', '2025-11-19 18:22:44', '1'),
(29, 1002, '::1', '2025-11-19 16:21:49', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xOSAxNjoyMTo0OSIsImNodiI6MSwiaWF0IjoxNzYzNTgwMTA5LCJleHAiOjE3NjM1OTA5MDl9.Z6qvWiF2IrUbtHxEXXpvXomr3IQqlPByPU7_TyQfWeI', '2025-11-19 19:21:49', '1'),
(30, 1002, '::1', '2025-11-19 18:13:48', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xOSAxODoxMzo0OCIsImNodiI6MSwiaWF0IjoxNzYzNTg2ODI4LCJleHAiOjE3NjM1OTc2Mjh9.fbMbpIFyJhNtMk35lmwv5hIeupGqcGghzCDCC5EuMnM', '2025-11-19 21:13:48', '1'),
(31, 1002, '::1', '2025-11-19 18:27:23', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xOSAxODoyNzoyMyIsImNodiI6MSwiaWF0IjoxNzYzNTg3NjQzLCJleHAiOjE3NjM1OTg0NDN9.Ip6Mp1KGc-Kw00yML8F1oTkZy14xixK8fBLhF0EF478', '2025-11-19 21:27:23', '1'),
(32, 1002, '::1', '2025-11-19 18:45:04', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0xOSAxODo0NTowNCIsImNodiI6MSwiaWF0IjoxNzYzNTg4NzA0LCJleHAiOjE3NjM1OTk1MDR9.RG0IxnLrCG41TMf3Gsw5ASUHhcKwBQhzsmcp0ka8tzQ', '2025-11-19 21:45:04', '1'),
(33, 100001, '::ffff:192.168.0.3', '2025-11-19 18:56:06', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTE5IDE4OjU2OjA2IiwiY2h2IjoxLCJpYXQiOjE3NjM1ODkzNjYsImV4cCI6MTc2MzYwMDE2Nn0.W3he3J0QMfDS6rcYgdVpOce4Zz3yH8kYK_a1U-PtDHg', '2025-11-19 21:56:06', '1'),
(34, 1002, '::1', '2025-11-22 11:19:48', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yMiAxMToxOTo0OCIsImNodiI6MSwiaWF0IjoxNzYzODIxMTg4LCJleHAiOjE3NjM4MzE5ODh9.LLqj4Jmol3vU6hEsxgONCdAA3na6RM4kC4f0kCx9HuI', '2025-11-22 14:19:48', '1'),
(35, 100001, '::ffff:192.168.0.3', '2025-11-22 11:29:19', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTIyIDExOjI5OjE5IiwiY2h2IjoxLCJpYXQiOjE3NjM4MjE3NTksImV4cCI6MTc2MzgzMjU1OX0.2-d9AP8L0w8SptGp1z9gXeOucJY3mW_23YHOfpf1UqE', '2025-11-22 14:29:19', '1'),
(36, 1002, '::1', '2025-11-22 11:32:54', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yMiAxMTozMjo1NCIsImNodiI6MSwiaWF0IjoxNzYzODIxOTc0LCJleHAiOjE3NjM4MzI3NzR9.kAyvZDfAqyxn6eJbgRYw-c1Z5ylw_Ids3_XI8MotyGQ', '2025-11-22 14:32:54', '1'),
(37, 1003, '::1', '2025-11-22 11:33:57', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMywiZHRfYWNjZXNzIjoiMjAyNS0xMS0yMiAxMTozMzo1NyIsImNodiI6MSwiaWF0IjoxNzYzODIyMDM3LCJleHAiOjE3NjM4MzI4Mzd9._Byj4ZnxqlAHlSHXEcySdQ7uUx1m93F9wM_1GGvcsKA', '2025-11-22 14:33:57', '1'),
(38, 1002, '::1', '2025-11-22 14:04:04', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yMiAxNDowNDowNCIsImNodiI6MSwiaWF0IjoxNzYzODMxMDQ1LCJleHAiOjE3NjM4NDE4NDV9.col_EFg6qLRWP35rFrRXTfxGZ-uCRs7n6A9hhR75hSI', '2025-11-22 17:04:04', '1'),
(39, 1002, '::1', '2025-11-22 16:27:47', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yMiAxNjoyNzo0NyIsImNodiI6MSwiaWF0IjoxNzYzODM5NjY3LCJleHAiOjE3NjM4NTA0Njd9.KMvgoIECyvO3lG_1ZFbRTc7b6T4JS_W0Oq4DF0TKk7E', '2025-11-22 19:27:47', '1'),
(40, 1005, '::1', '2025-11-24 12:01:17', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwNSwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yNCAxMjowMToxNyIsImNodiI6MSwiaWF0IjoxNzYzOTk2NDc3LCJleHAiOjE3NjQwMDcyNzd9.XDntCZEL4hW-LnJm-YiQqJk_-eeOM_uaS-ls-z6xWYE', '2025-11-24 15:01:17', '1'),
(41, 1015, '::1', '2025-11-24 13:27:34', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxNSwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yNCAxMzoyNzozNCIsImNodiI6MSwiaWF0IjoxNzY0MDAxNjU0LCJleHAiOjE3NjQwMTI0NTR9.5TWFuPlI1WBh20SIvLkVFMqE065c3BCwjMMGpnUJX00', '2025-11-24 16:27:34', '1'),
(42, 1016, '::1', '2025-11-24 13:38:07', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxNiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yNCAxMzozODowNyIsImNodiI6MSwiaWF0IjoxNzY0MDAyMjg3LCJleHAiOjE3NjQwMTMwODd9.7OSu8VR3mcl9KO06MVwwnFJ6EyCffgyrtbNPROFne3s', '2025-11-24 16:38:07', '1'),
(43, 1017, '::1', '2025-11-24 13:51:19', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxNywiZHRfYWNjZXNzIjoiMjAyNS0xMS0yNCAxMzo1MToxOSIsImNodiI6MSwiaWF0IjoxNzY0MDAzMDc5LCJleHAiOjE3NjQwMTM4Nzl9.aTrQ9j_EwE1qgfub_akdiEgn-VwKHbFZv5OG2MxEyJo', '2025-11-24 16:51:19', '1'),
(44, 1002, '::1', '2025-11-24 14:03:36', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yNCAxNDowMzozNiIsImNodiI6MSwiaWF0IjoxNzY0MDAzODE2LCJleHAiOjE3NjQwMTQ2MTZ9.GF-NqreLmEStIUq2uCxGxQcir22DJ7lZe340uy3TbTo', '2025-11-24 17:03:36', '1'),
(45, 1003, '::1', '2025-11-24 14:04:09', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMywiZHRfYWNjZXNzIjoiMjAyNS0xMS0yNCAxNDowNDowOSIsImNodiI6MSwiaWF0IjoxNzY0MDAzODQ5LCJleHAiOjE3NjQwMTQ2NDl9.66JAq-hhY5xjPXX26AtRxw6x-nHljyqDvf85FGSVqwE', '2025-11-24 17:04:09', '1'),
(46, 1017, '::1', '2025-11-24 14:04:30', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAxNywiZHRfYWNjZXNzIjoiMjAyNS0xMS0yNCAxNDowNDozMCIsImNodiI6MSwiaWF0IjoxNzY0MDAzODcwLCJleHAiOjE3NjQwMTQ2NzB9.OMVGVOBvxD5Fh4NhqI30GbSjrQPjrA0mUG8sIwfStIM', '2025-11-24 17:04:30', '1'),
(47, 1001, '::1', '2025-11-24 14:05:45', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMSwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yNCAxNDowNTo0NSIsImNodiI6MSwiaWF0IjoxNzY0MDAzOTQ1LCJleHAiOjE3NjQwMTQ3NDV9.Y9YvuDebGfGOkDepWxwkvUZ6kktVKl49PTFGmcyGqik', '2025-11-24 17:05:45', '1'),
(48, 1001, '::1', '2025-11-24 14:09:43', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMSwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yNCAxNDowOTo0MyIsImNodiI6MSwiaWF0IjoxNzY0MDA0MTgzLCJleHAiOjE3NjQwMTQ5ODN9.eJFdlhZ22mRMPBIk6hvCG6XH5UF_7jkcjTlbQO0nP0I', '2025-11-24 17:09:43', '1'),
(49, 100001, '201.17.157.61', '2025-11-24 14:46:06', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTI0IDE0OjQ2OjA2IiwiY2h2IjoxLCJpYXQiOjE3NjQwMDYzNjYsImV4cCI6MTc2NDAxNzE2Nn0.Ad3Llno0Mk3deCht4pGvDw5Ua9_oQ_ejj-94VaLc1A0', '2025-11-24 17:46:06', '1'),
(50, 1002, '201.17.157.61', '2025-11-24 14:51:50', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yNCAxNDo1MTo1MCIsImNodiI6MSwiaWF0IjoxNzY0MDA2NzEwLCJleHAiOjE3NjQwMTc1MTB9.bBXMfgXh_gz67xZy1COta6RflyCGkdxofxOEKCKiAio', '2025-11-24 17:51:50', '1'),
(51, 100001, '201.17.157.61', '2025-11-24 21:02:28', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTI0IDIxOjAyOjI4IiwiY2h2IjoxLCJpYXQiOjE3NjQwMjg5NDgsImV4cCI6MTc2NDAzOTc0OH0.wCZ5HLtK87F2Bi4ieofaCtEnqY9qIerV_40p-psl1gI', '2025-11-25 00:02:28', '1'),
(52, 1002, '201.17.208.30', '2025-11-25 08:53:49', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yNSAwODo1Mzo0OSIsImNodiI6MSwiaWF0IjoxNzY0MDcxNjI5LCJleHAiOjE3NjQwODI0Mjl9.TKJp-BbWF1O4rPFBwNcWCVmUbKmUjY_xtd0yFqRIsmU', '2025-11-25 11:53:49', '1'),
(53, 100001, '201.17.208.30', '2025-11-25 08:54:14', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTExLTI1IDA4OjU0OjE0IiwiY2h2IjoxLCJpYXQiOjE3NjQwNzE2NTQsImV4cCI6MTc2NDA4MjQ1NH0.aBEKOMMiNVGMzMdMvKBYBNbsja3JGwxEYMPcwnxGdCk', '2025-11-25 11:54:14', '1'),
(54, 1002, '201.17.208.30', '2025-11-25 08:58:56', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yNSAwODo1ODo1NiIsImNodiI6MSwiaWF0IjoxNzY0MDcxOTM2LCJleHAiOjE3NjQwODI3MzZ9.P5oyZAP2GcNwrYGur8m9im4CCPhrnaSllFSy8n7hbto', '2025-11-25 11:58:56', '1'),
(55, 1002, '201.17.157.61', '2025-11-29 17:44:38', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMS0yOSAxNzo0NDozOCIsImNodiI6MSwiaWF0IjoxNzY0NDQ5MDc4LCJleHAiOjE3NjQ0NTk4Nzh9.sh0MiHPlWAa6UjPXAicLFdNd7FkFhHBMJFl9z_n6UVw', '2025-11-29 20:44:38', '1'),
(56, 100001, '187.68.16.60', '2025-12-01 08:48:50', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTEyLTAxIDA4OjQ4OjUwIiwiY2h2IjoxLCJpYXQiOjE3NjQ1ODk3MzAsImV4cCI6MTc2NDYwMDUzMH0.n0Rno7UvEkCV_EwIqqMceSx8J3WAurU3iXXrXkEK5GE', '2025-12-01 11:48:50', '1'),
(57, 100001, '187.68.16.60', '2025-12-01 08:51:19', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTEyLTAxIDA4OjUxOjE5IiwiY2h2IjoxLCJpYXQiOjE3NjQ1ODk4NzksImV4cCI6MTc2NDYwMDY3OX0.YJZtjpCH1f0RUogPNus-TMCy-lDVCTukmZlPpI1xzHM', '2025-12-01 11:51:19', '1'),
(58, 1002, '201.17.208.30', '2025-12-01 08:52:18', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMi0wMSAwODo1MjoxOCIsImNodiI6MSwiaWF0IjoxNzY0NTg5OTM4LCJleHAiOjE3NjQ2MDA3Mzh9.sWrpFLBCYh4IkxYFnR7_O8KgSiaF5MKbnHUt-Z6q8KM', '2025-12-01 11:52:18', '1'),
(59, 1002, '::1', '2025-12-01 09:23:36', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMi0wMSAwOToyMzozNiIsImNodiI6MSwiaWF0IjoxNzY0NTkxODE2LCJleHAiOjE3NjQ2MDI2MTZ9.eAIBwPfCD3FeCb87pjxnBA5YBkn5UJLO6PjN9iFwH0U', '2025-12-01 12:23:36', '1'),
(60, 1002, '::1', '2025-12-01 10:45:45', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMi0wMSAxMDo0NTo0NSIsImNodiI6MSwiaWF0IjoxNzY0NTk2NzQ1LCJleHAiOjE3NjQ2MDc1NDV9.plSSiulVfZsXLGDyJY7FGDOGBhhRrsghvkTXPq1jWGQ', '2025-12-01 13:45:45', '1'),
(61, 100001, '192.168.0.231', '2025-12-01 10:50:04', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTEyLTAxIDEwOjUwOjA0IiwiY2h2IjoxLCJpYXQiOjE3NjQ1OTcwMDQsImV4cCI6MTc2NDYwNzgwNH0.KtWNB7cWb-lqkUDbxZwZpDq5L_w4K7sa2Zg_y3WRCiA', '2025-12-01 13:50:04', '1'),
(62, 1002, '::1', '2025-12-01 11:27:59', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMi0wMSAxMToyNzo1OSIsImNodiI6MSwiaWF0IjoxNzY0NTk5Mjc5LCJleHAiOjE3NjQ2MTAwNzl9.uJLKNrzCKxYVRAAztNaGXVgTp-XR9BF0qcWzxzADsko', '2025-12-01 14:27:59', '1'),
(63, 1002, '::1', '2025-12-02 09:20:26', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMi0wMiAwOToyMDoyNiIsImNodiI6MSwiaWF0IjoxNzY0Njc4MDI2LCJleHAiOjE3NjQ2ODg4MjZ9.USCnzzU9z_kqD1tVBY8AkNCqLtGupFNdcERzV_BO_TM', '2025-12-02 12:20:26', '1'),
(64, 100001, '192.168.0.239', '2025-12-02 09:38:12', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI1LTEyLTAyIDA5OjM4OjEyIiwiY2h2IjoxLCJpYXQiOjE3NjQ2NzkwOTIsImV4cCI6MTc2NDY4OTg5Mn0.KKP0uElHz8Yr8NzTZBVjulRQuI1bnrR6nuDpWESRN7c', '2025-12-02 12:38:12', '1'),
(65, 1003, '::1', '2025-12-02 09:41:17', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMywiZHRfYWNjZXNzIjoiMjAyNS0xMi0wMiAwOTo0MToxNyIsImNodiI6MSwiaWF0IjoxNzY0Njc5Mjc3LCJleHAiOjE3NjQ2OTAwNzd9.7PfA2WBkyWrB_z3TgJMQnz387yt0Fc893AeWXmEPS-M', '2025-12-02 12:41:17', '1'),
(66, 1002, '::1', '2025-12-02 09:41:52', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMi0wMiAwOTo0MTo1MiIsImNodiI6MSwiaWF0IjoxNzY0Njc5MzEyLCJleHAiOjE3NjQ2OTAxMTJ9.BbF_RNZkrVTDzM8DWqr8Cvxpmw5vYCGcAvwujGpsA8M', '2025-12-02 12:41:52', '1');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `USER_ID` int NOT NULL,
  `FIREBASE_UID` varchar(128) DEFAULT NULL,
  `NOME` varchar(60) NOT NULL,
  `SOBRENOME` varchar(60) NOT NULL,
  `TELEFONE` varchar(18) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `URL_IMAGEM` varchar(240) NOT NULL,
  `CHV` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`USER_ID`, `FIREBASE_UID`, `NOME`, `SOBRENOME`, `TELEFONE`, `EMAIL`, `URL_IMAGEM`, `CHV`) VALUES
(100001, 'x1OFq9mZLjWLBYSe37EksjjEzVd2', 'Ezequias', 'Martins', '(31) 98410-7540', 'ezequiasmartins@gmail.com', 'https://firebasestorage.googleapis.com/v0/b/psi-deliverybairro.firebasestorage.app/o/usuarios%2F100001%2Fprofile_1762983646063.jpg?alt=media&token=98e84d77-9b19-4628-82c7-483a20c35043', '1');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`ADMIN_ID`),
  ADD UNIQUE KEY `USER_EMAIL` (`USER_EMAIL`),
  ADD KEY `idx_email` (`USER_EMAIL`);

--
-- Indexes for table `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`CATEGORIA_ID`);

--
-- Indexes for table `couriers`
--
ALTER TABLE `couriers`
  ADD PRIMARY KEY (`COURIER_ID`);

--
-- Indexes for table `deliveries`
--
ALTER TABLE `deliveries`
  ADD PRIMARY KEY (`DELIVERY_ID`);

--
-- Indexes for table `extras`
--
ALTER TABLE `extras`
  ADD PRIMARY KEY (`EXTRA_ID`);

--
-- Indexes for table `itens`
--
ALTER TABLE `itens`
  ADD PRIMARY KEY (`ITEM_ID`),
  ADD KEY `id_pedido` (`PEDIDO_ID`),
  ADD KEY `id_produto` (`PRODUTO_ID`);

--
-- Indexes for table `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`PEDIDO_ID`),
  ADD KEY `id_usuario` (`USER_ID`);

--
-- Indexes for table `pix_transactions`
--
ALTER TABLE `pix_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `txid` (`txid`),
  ADD KEY `idx_txid` (`txid`);

--
-- Indexes for table `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`PRODUTO_ID`),
  ADD KEY `CategoriaID` (`DELIVERY_ID`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`LOG_ID`),
  ADD KEY `fk_log_admin` (`ADMIN_ID`),
  ADD KEY `idx_action` (`ACTION`),
  ADD KEY `idx_entity` (`ENTITY_TYPE`,`ENTITY_ID`),
  ADD KEY `idx_created` (`CREATED_AT`);

--
-- Indexes for table `taxa`
--
ALTER TABLE `taxa`
  ADD PRIMARY KEY (`TAXA_ID`);

--
-- Indexes for table `taxas_config`
--
ALTER TABLE `taxas_config`
  ADD PRIMARY KEY (`CONFIG_ID`),
  ADD KEY `fk_taxas_admin` (`UPDATED_BY`);

--
-- Indexes for table `taxas_config_history`
--
ALTER TABLE `taxas_config_history`
  ADD PRIMARY KEY (`HISTORY_ID`),
  ADD KEY `fk_history_admin` (`CHANGED_BY`),
  ADD KEY `idx_changed_at` (`CHANGED_AT`);

--
-- Indexes for table `taxas_exceptions`
--
ALTER TABLE `taxas_exceptions`
  ADD PRIMARY KEY (`EXCEPTION_ID`),
  ADD KEY `fk_exception_delivery` (`DELIVERY_ID`),
  ADD KEY `fk_exception_admin` (`CREATED_BY`),
  ADD KEY `idx_active` (`ACTIVE`);

--
-- Indexes for table `userlog`
--
ALTER TABLE `userlog`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`USER_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `ADMIN_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categorias`
--
ALTER TABLE `categorias`
  MODIFY `CATEGORIA_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `couriers`
--
ALTER TABLE `couriers`
  MODIFY `COURIER_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=200003;

--
-- AUTO_INCREMENT for table `deliveries`
--
ALTER TABLE `deliveries`
  MODIFY `DELIVERY_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1018;

--
-- AUTO_INCREMENT for table `extras`
--
ALTER TABLE `extras`
  MODIFY `EXTRA_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `itens`
--
ALTER TABLE `itens`
  MODIFY `ITEM_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=135;

--
-- AUTO_INCREMENT for table `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `PEDIDO_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1098;

--
-- AUTO_INCREMENT for table `pix_transactions`
--
ALTER TABLE `pix_transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `produtos`
--
ALTER TABLE `produtos`
  MODIFY `PRODUTO_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1084;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `LOG_ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taxa`
--
ALTER TABLE `taxa`
  MODIFY `TAXA_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `taxas_config`
--
ALTER TABLE `taxas_config`
  MODIFY `CONFIG_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `taxas_config_history`
--
ALTER TABLE `taxas_config_history`
  MODIFY `HISTORY_ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taxas_exceptions`
--
ALTER TABLE `taxas_exceptions`
  MODIFY `EXCEPTION_ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `userlog`
--
ALTER TABLE `userlog`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `USER_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1000000;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD CONSTRAINT `fk_log_admin` FOREIGN KEY (`ADMIN_ID`) REFERENCES `admin_users` (`ADMIN_ID`) ON DELETE SET NULL;

--
-- Constraints for table `taxas_config`
--
ALTER TABLE `taxas_config`
  ADD CONSTRAINT `fk_taxas_admin` FOREIGN KEY (`UPDATED_BY`) REFERENCES `admin_users` (`ADMIN_ID`) ON DELETE SET NULL;

--
-- Constraints for table `taxas_config_history`
--
ALTER TABLE `taxas_config_history`
  ADD CONSTRAINT `fk_history_admin` FOREIGN KEY (`CHANGED_BY`) REFERENCES `admin_users` (`ADMIN_ID`) ON DELETE SET NULL;

--
-- Constraints for table `taxas_exceptions`
--
ALTER TABLE `taxas_exceptions`
  ADD CONSTRAINT `fk_exception_admin` FOREIGN KEY (`CREATED_BY`) REFERENCES `admin_users` (`ADMIN_ID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_exception_delivery` FOREIGN KEY (`DELIVERY_ID`) REFERENCES `deliveries` (`DELIVERY_ID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
