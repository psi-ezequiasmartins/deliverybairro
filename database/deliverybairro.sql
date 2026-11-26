-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Tempo de geração: 26/11/2026 às 21:18
-- Versão do servidor: 10.11.10-MariaDB-log
-- Versão do PHP: 8.2.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `deliverybairro`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `admin_users`
--

CREATE TABLE `admin_users` (
  `ADMIN_ID` int(11) NOT NULL,
  `USER_EMAIL` varchar(255) NOT NULL,
  `USER_PASSWORD` varchar(255) NOT NULL,
  `NOME` varchar(100) NOT NULL,
  `ROLE` enum('SUPER_ADMIN','ADMIN','SUPPORT') DEFAULT 'ADMIN',
  `CREATED_AT` timestamp NOT NULL DEFAULT current_timestamp(),
  `LAST_LOGIN` timestamp NULL DEFAULT NULL,
  `ACTIVE` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `admin_users`
--

INSERT INTO `admin_users` (`ADMIN_ID`, `USER_EMAIL`, `USER_PASSWORD`, `NOME`, `ROLE`, `CREATED_AT`, `LAST_LOGIN`, `ACTIVE`) VALUES
(1, 'admin@deliverybairro.com', '9af30b377a951b997ced093953603fa61c5d8955', 'Administrador', 'SUPER_ADMIN', '2025-12-03 13:56:41', '2026-08-08 21:04:51', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `auth_password_resets`
--

CREATE TABLE `auth_password_resets` (
  `RESET_ID` int(10) UNSIGNED NOT NULL,
  `ACCOUNT_TYPE` enum('user','courier') NOT NULL,
  `ACCOUNT_ID` int(11) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `CODE_HASH` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `EXPIRES_AT` datetime NOT NULL,
  `USED_AT` datetime DEFAULT NULL,
  `CREATED_AT` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `categorias`
--

CREATE TABLE `categorias` (
  `CATEGORIA_ID` int(11) NOT NULL,
  `CATEGORIA_NOME` varchar(100) DEFAULT NULL,
  `URL_IMAGEM` varchar(240) NOT NULL,
  `ORDEM` tinyint(4) DEFAULT NULL,
  `CHV` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `categorias`
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
-- Estrutura para tabela `couriers`
--

CREATE TABLE `couriers` (
  `COURIER_ID` int(11) NOT NULL,
  `NOME` varchar(60) NOT NULL,
  `SOBRENOME` varchar(60) NOT NULL,
  `TELEFONE` varchar(18) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `PASSWORD` varchar(240) DEFAULT NULL,
  `TRANSPORTE` enum('DRIVING','BICYCLING','WALKING') NOT NULL,
  `PLACA` varchar(10) NOT NULL,
  `URL_IMAGEM` varchar(240) NOT NULL,
  `CHV` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `couriers`
--

INSERT INTO `couriers` (`COURIER_ID`, `NOME`, `SOBRENOME`, `TELEFONE`, `EMAIL`, `PASSWORD`, `TRANSPORTE`, `PLACA`, `URL_IMAGEM`, `CHV`) VALUES
(200001, 'Zé das Couves', '', '+55 31 98410-7540', '', NULL, 'DRIVING', '', 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/couriers%2Fzedascouves.png?alt=media&token=efd215ba-70ae-450b-8aa0-7b978c56559e', '1'),
(200002, 'Ezequias', 'Martins ', '(31) 98410-7540', 'ezequiasmartins@yahoo.com.br', NULL, 'BICYCLING', 'AAAA-9999 ', '', '1');

-- --------------------------------------------------------

--
-- Estrutura para tabela `deliveries`
--

CREATE TABLE `deliveries` (
  `DELIVERY_ID` int(11) NOT NULL,
  `DELIVERY_NOME` varchar(100) NOT NULL,
  `PLANO` enum('FREE','BASIC','PRO','PREMIUM') DEFAULT 'FREE',
  `CATEGORIA_ID` int(11) DEFAULT NULL,
  `RESPONSAVEL` varchar(60) DEFAULT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `TELEFONE` varchar(18) DEFAULT NULL,
  `HORARIO` varchar(100) DEFAULT NULL,
  `MIN_DELIVERY_TIME` int(11) DEFAULT NULL,
  `MAX_DELIVERY_TIME` int(11) DEFAULT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `deliveries`
--

INSERT INTO `deliveries` (`DELIVERY_ID`, `DELIVERY_NOME`, `PLANO`, `CATEGORIA_ID`, `RESPONSAVEL`, `EMAIL`, `TELEFONE`, `HORARIO`, `MIN_DELIVERY_TIME`, `MAX_DELIVERY_TIME`, `TAXA_ENTREGA`, `RATING`, `URL_IMAGEM`, `CEP`, `ENDERECO`, `NUMERO`, `COMPLEMENTO`, `BAIRRO`, `CIDADE`, `UF`, `LATITUDE`, `LONGITUDE`, `CHV`, `VALIDATION_CODE`) VALUES
(1001, 'Cantin d\'Minas Delivery', 'PRO', 105, 'José Antônio de Oliveira e Cida', 'joseantoniodeoliveira71@gmail.com', '+55 31 98775-9781', 'Aberto das 9h até às 19h de Segunda a Sábado', 15, 30, 4.5, 4.9, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/deliverys%2Fcantindminasdelivery.jpg?alt=media&token=a6259473-4eb1-4f0e-98ce-251b151bab9f', '31530-390', 'Rua Antônio Junqueira Júnior', '77', '', 'Santa Mônica', 'Belo Horizonte', 'MG', -19.826684, -43.983459, '1', NULL),
(1002, 'Sanduba do Zé', 'PREMIUM', 102, 'Zé das Couves', 'zedascouves@email.com', '+55 31 98410-7540', 'Aberto todos os dias a partir das 19h exceto às segundas feiras (fechado)', 15, 45, 4, 3.5, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/deliverys%2Fsandubadoze.jpg?alt=media&token=3bac7899-904e-4acd-aac8-75506a1d6819', '31525-365', 'Rua Érico Veríssimo', '2267', 'Loja B', 'Santa Mônica', 'Belo Horizonte', 'MG', -19.822279, -43.978664, '1', NULL),
(1003, 'Hotdog da Maria', 'PRO', 103, 'Maria das Graças ', 'mariadg@email.com', '+55 31 9999-9999', 'Aberto a partir das 19h', 15, 30, 3.5, 4.7, 'https://firebasestorage.googleapis.com/v0/b/psi-crm-ca846.appspot.com/o/deliverys%2Fhotdogdamaria.jpg?alt=media&token=93d46c8d-abe3-4008-aa2d-c9a81a6c23fb', '', 'Rua dos Bororós', '629 ', '', 'Santa Mônica', 'Belo Horizonte', 'MG', -19.825318, -43.983096, '1', NULL),
(1006, 'Distribuidora Guarani', 'FREE', 104, 'José Carlos dos Santos', 'josecarlossantos0659@gmail.com', '(31) 98651-1043', NULL, NULL, NULL, NULL, NULL, NULL, '31812-260', 'Rua Jornalista Laércio Campos', '417', 'loja', 'Minaslândia (P Maio)', 'Belo Horizonte', 'MG', NULL, NULL, '1', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `extras`
--

CREATE TABLE `extras` (
  `EXTRA_ID` int(11) NOT NULL,
  `DESCRICAO` varchar(100) NOT NULL,
  `VR_UNITARIO` float(9,2) NOT NULL,
  `DELIVERY_ID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `extras`
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
-- Estrutura para tabela `itens`
--

CREATE TABLE `itens` (
  `ITEM_ID` int(11) NOT NULL,
  `PEDIDO_ID` int(11) NOT NULL,
  `PRODUTO_ID` int(11) NOT NULL,
  `ACRESCIMOS` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `OBS` varchar(300) DEFAULT NULL,
  `QTD` float(9,2) DEFAULT NULL,
  `VR_UNITARIO` float(9,2) DEFAULT NULL,
  `VR_ACRESCIMOS` float(9,2) DEFAULT NULL,
  `TOTAL` float(9,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `itens`
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
(134, 1097, 1025, '[]', '', 1.00, 4.80, 0.00, 4.80),
(135, 1098, 1020, '[{\"EXTRA_ID\":5,\"DESCRICAO\":\"Salada Americana\",\"VR_UNITARIO\":1,\"DELIVERY_ID\":1002},{\"EXTRA_ID\":2,\"DESCRICAO\":\"Bacon Fatiado 50g\",\"VR_UNITARIO\":3.5,\"DELIVERY_ID\":1002}]', '', 1.00, 25.60, 4.50, 30.10),
(136, 1098, 1025, '[]', '', 1.00, 4.80, 0.00, 4.80);

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedidos`
--

CREATE TABLE `pedidos` (
  `PEDIDO_ID` int(11) NOT NULL,
  `DELIVERY_ID` int(11) DEFAULT NULL,
  `USER_ID` int(11) DEFAULT NULL,
  `DATA` datetime DEFAULT NULL,
  `ENDERECO_ENTREGA` varchar(100) NOT NULL,
  `LATITUDE` decimal(11,8) NOT NULL,
  `LONGITUDE` decimal(11,8) NOT NULL,
  `VR_SUBTOTAL` float(9,2) DEFAULT NULL,
  `TAXA_ENTREGA` float(9,2) DEFAULT NULL,
  `TAXA_SERVICO` float(9,2) NOT NULL,
  `TAXA_PAGAMENTO_FIXA` float(9,2) NOT NULL,
  `TAXA_PAGAMENTO_PERCENTUAL` float(9,2) NOT NULL,
  `TAXA_PAGAMENTO_VALOR` float(9,2) NOT NULL,
  `VR_TOTAL` float(9,2) DEFAULT NULL,
  `STATUS` enum('NOVO','AGUARDANDO','PREPARANDO','PRONTO_PARA_RETIRADA','SAIU_PARA_ENTREGA','ENTREGUE','PGTO_PENDENTE','PGTO_OK','FINALIZADO','CANCELADO') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `pedidos`
--

INSERT INTO `pedidos` (`PEDIDO_ID`, `DELIVERY_ID`, `USER_ID`, `DATA`, `ENDERECO_ENTREGA`, `LATITUDE`, `LONGITUDE`, `VR_SUBTOTAL`, `TAXA_ENTREGA`, `TAXA_SERVICO`, `TAXA_PAGAMENTO_FIXA`, `TAXA_PAGAMENTO_PERCENTUAL`, `TAXA_PAGAMENTO_VALOR`, `VR_TOTAL`, `STATUS`) VALUES
(1051, 1002, 100001, '2025-03-20 18:42:05', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250  ', -19.82724000, -43.98316000, 72.80, 4.00, 0.00, 0.00, 0.00, 0.00, 76.80, 'FINALIZADO'),
(1052, 1002, 100001, '2025-03-20 18:59:01', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250 ', -19.82724000, -43.98316000, 65.78, 4.00, 0.00, 0.00, 0.00, 0.00, 69.78, 'FINALIZADO'),
(1053, 1002, 100001, '2025-03-20 21:37:15', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250 ', -19.82724000, -43.98316000, 85.78, 4.00, 0.00, 0.00, 0.00, 0.00, 89.78, 'FINALIZADO'),
(1054, 1002, 100001, '2025-03-20 22:34:24', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250 ', -19.82724000, -43.98316000, 86.68, 4.00, 0.00, 0.00, 0.00, 0.00, 90.68, 'FINALIZADO'),
(1055, 1002, 100001, '2025-03-20 15:58:12', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250 ', -19.82724000, -43.98316000, 60.79, 4.00, 0.00, 0.00, 0.00, 0.00, 64.79, 'FINALIZADO'),
(1059, 1002, 100001, '2025-03-21 21:16:44', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250 ', -19.82724000, -43.98316000, 27.90, 4.00, 0.00, 0.00, 0.00, 0.00, 31.90, 'FINALIZADO'),
(1079, 1002, 100001, '2025-04-03 17:58:50', 'Rua Alcides Lins, 320, Venda Nova, 31510-030\r\n\r\n', -19.81641497, -43.95921010, 63.78, 4.00, 0.00, 0.00, 0.00, 0.00, 67.78, 'FINALIZADO'),
(1080, 1002, 100001, '2025-04-22 00:16:25', 'Rua dos Apaches, 870, Santa Monica, 31530-280', -19.82729230, -43.98321370, 99.76, 4.00, 0.00, 0.00, 0.00, 0.00, 103.76, 'FINALIZADO'),
(1081, 1003, 100001, '2025-05-01 15:42:09', 'Rua dos Comanches, 870, Santa Monica, 31530-250', -19.82725810, -43.98318010, 68.00, 3.50, 0.00, 0.00, 0.00, 0.00, 71.50, 'FINALIZADO'),
(1082, 1002, NULL, '2025-09-24 21:11:14', 'Rua dos Comanches, 870 Apto 302 Santa Mônica CEP 31530-250', -19.82724370, -43.98307500, 67.00, 4.00, 0.00, 0.00, 0.00, 0.00, 71.00, 'NOVO'),
(1083, 1002, 100001, '2025-09-24 21:31:13', 'Rua dos Apaches, 870, Santa Monica, 31530-280', -19.82726050, -43.98317840, 31.10, 4.00, 0.00, 0.00, 0.00, 0.00, 35.10, 'FINALIZADO'),
(1084, 1002, 100001, '2025-09-25 21:08:37', 'Rua dos Comanches, 870, Apto 302, Santa Monica, 31530-250', -19.82719110, -43.98311470, 47.99, 4.00, 0.00, 0.00, 0.00, 0.00, 51.99, 'NOVO'),
(1085, 1002, 100001, '2025-09-26 15:26:05', 'Rua dos Comanches, 870, Apto 302, Santa Monica, 31530-250', -19.82732730, -43.98320140, 65.40, 4.00, 0.00, 0.00, 0.00, 0.00, 69.40, 'NOVO'),
(1086, 1003, 100001, '2025-09-26 15:30:52', 'Rua dos Comanches, 870, Apto 302 Santa Monica, 31530-250', -19.82722320, -43.98310900, 38.00, 3.50, 0.00, 0.00, 0.00, 0.00, 41.50, 'NOVO'),
(1087, 1003, 100001, '2025-10-03 15:20:42', 'Rua dos Comanches, 860, Santa Monica, Minas Gerais, 31530-250', -19.82721790, -43.98304120, 44.40, 3.50, 0.00, 0.00, 0.00, 0.00, 47.90, 'NOVO'),
(1088, 1003, 100001, '2025-10-08 22:18:02', 'Rua dos Apaches, 870, Santa Monica, Minas Gerais, 31530-280', -19.82721040, -43.98311450, 17.20, 3.50, 0.00, 0.00, 0.00, 0.00, 20.70, 'NOVO'),
(1089, 1002, 100001, '2025-10-14 00:30:16', 'Rua dos Comanches, 860, Santa Monica, Minas Gerais, 31530-250', -19.82720700, -43.98306120, 63.80, 4.00, 0.00, 0.00, 0.00, 0.00, 67.80, 'FINALIZADO'),
(1090, 1002, 100001, '2025-11-08 13:34:02', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82718320, -43.98302290, 34.70, 4.00, 0.00, 0.00, 0.00, 0.00, 38.70, 'FINALIZADO'),
(1091, 1002, 100001, '2025-11-08 20:51:50', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82718440, -43.98302610, 34.70, 4.00, 0.00, 0.00, 0.00, 0.00, 38.70, 'PGTO_OK'),
(1092, 1002, 100001, '2025-11-08 20:59:14', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82723910, -43.98306780, 64.30, 4.00, 0.00, 0.00, 0.00, 0.00, 68.30, 'PGTO_PENDENTE'),
(1093, 1002, 100001, '2025-11-09 14:20:33', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82723770, -43.98304270, 64.80, 4.00, 0.00, 0.00, 0.00, 0.00, 68.80, 'ENTREGUE'),
(1094, 1003, 100001, '2025-11-09 14:27:16', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82715950, -43.98311440, 35.50, 3.50, 0.00, 0.00, 0.00, 0.00, 39.00, 'SAIU_PARA_ENTREGA'),
(1095, 1002, 100001, '2025-11-09 20:29:46', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82723280, -43.98302300, 27.90, 4.00, 0.00, 0.00, 0.00, 0.00, 31.90, 'PRONTO_PARA_RETIRADA'),
(1096, 1002, 100001, '2025-11-12 20:30:19', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82720280, -43.98302970, 55.48, 4.00, 0.00, 0.00, 0.00, 0.00, 59.48, 'PREPARANDO'),
(1097, 1002, 100001, '2025-12-01 08:50:46', 'Rua Alcídes Lins, 320, Venda Nova, Minas Gerais, 31510-030', -19.81642560, -43.95922110, 88.30, 4.00, 0.00, 0.00, 0.00, 0.00, 92.30, 'NOVO'),
(1098, 1002, 100001, '2026-02-14 13:30:37', 'Rua dos Comanches, 870, Santa Monica, Minas Gerais, 31530-250', -19.82722880, -43.98300520, 34.90, 4.00, 0.99, 0.40, 3.99, 1.59, 41.88, 'PGTO_PENDENTE');

-- --------------------------------------------------------

--
-- Estrutura para tabela `pix_transactions`
--

CREATE TABLE `pix_transactions` (
  `id` int(11) NOT NULL,
  `orderId` varchar(50) NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `status` varchar(20) NOT NULL,
  `txid` varchar(50) NOT NULL,
  `payload` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `pix_transactions`
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
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `PRODUTO_ID` int(11) NOT NULL,
  `DELIVERY_ID` int(11) NOT NULL,
  `PRODUTO_NOME` varchar(100) DEFAULT NULL,
  `DESCRICAO` varchar(1000) DEFAULT NULL,
  `VR_UNITARIO` float(9,2) DEFAULT NULL,
  `URL_IMAGEM` varchar(240) DEFAULT NULL,
  `ITENS_EXTRAS` varchar(1) NOT NULL,
  `ITENS_OBS` varchar(1) NOT NULL,
  `CHV` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `produtos`
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
(1070, 1002, 'X-Burguer Gourmet', 'Carne de Hamburguer Especial 200gr Grelhado,\nAlface, Rúcula, Cebola Roxa, Tomate, Queijo Cheddar, Pão Especial', 35.00, 'https://firebasestorage.googleapis.com/v0/b/psi-deliverybairro.firebasestorage.app/o/produtos%2Fhamburguer-artezanal.jpg?alt=media&token=a2d0077f-f46a-49fd-bcda-c3709262fa78', 'S', 'S', ''),
(1071, 1006, 'Cerveja Brahma Litrinho ', 'Cerveja Brahma Litrinho 300 ml', 5.50, 'https://placehold.co/500', 'N', 'N', '1');

-- --------------------------------------------------------

--
-- Estrutura para tabela `system_logs`
--

CREATE TABLE `system_logs` (
  `LOG_ID` int(11) NOT NULL,
  `ADMIN_ID` int(11) DEFAULT NULL,
  `ACTION` varchar(100) NOT NULL,
  `ENTITY_TYPE` varchar(50) DEFAULT NULL,
  `ENTITY_ID` int(11) DEFAULT NULL,
  `DETAILS` text DEFAULT NULL,
  `IP_ADDRESS` varchar(45) DEFAULT NULL,
  `USER_AGENT` varchar(255) DEFAULT NULL,
  `CREATED_AT` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `system_logs`
--

INSERT INTO `system_logs` (`LOG_ID`, `ADMIN_ID`, `ACTION`, `ENTITY_TYPE`, `ENTITY_ID`, `DETAILS`, `IP_ADDRESS`, `USER_AGENT`, `CREATED_AT`) VALUES
(1, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:192.168.0.211', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 13:56:49'),
(2, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:192.168.0.211', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 15:41:43'),
(3, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:192.168.0.211', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 15:56:59'),
(4, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:192.168.0.211', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 16:05:10'),
(5, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:192.168.0.211', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 16:26:15'),
(6, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-04 18:12:35'),
(7, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 14:41:01'),
(8, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-05 18:56:13'),
(9, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-06 21:02:22'),
(10, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-12-08 13:55:17'),
(11, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-06 17:01:46'),
(12, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-01-21 18:37:11'),
(13, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-14 16:52:18'),
(14, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-07-21 18:30:16'),
(15, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-08-08 20:59:57'),
(16, 1, 'LOGIN', NULL, NULL, 'Admin login realizado', '::ffff:127.0.0.1', 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', '2026-08-08 21:04:51');

-- --------------------------------------------------------

--
-- Estrutura para tabela `taxa`
--

CREATE TABLE `taxa` (
  `TAXA_ID` int(11) NOT NULL,
  `DELIVERY_ID` int(11) NOT NULL,
  `TAXA_ENTREGA` float(9,2) DEFAULT NULL,
  `CHV` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `taxa`
--

INSERT INTO `taxa` (`TAXA_ID`, `DELIVERY_ID`, `TAXA_ENTREGA`, `CHV`) VALUES
(1, 1001, 5.50, 'A'),
(2, 1002, 6.50, 'A'),
(3, 1003, 5.75, 'A');

-- --------------------------------------------------------

--
-- Estrutura para tabela `taxas_config`
--

CREATE TABLE `taxas_config` (
  `CONFIG_ID` int(11) NOT NULL,
  `TAXA_SERVICO` decimal(10,2) NOT NULL DEFAULT 0.99,
  `TAXA_SERVICO_ATIVA` tinyint(1) DEFAULT 1,
  `PSP_PROVIDER` varchar(50) DEFAULT 'PagSeguro',
  `TAXA_PAGAMENTO_FIXA` decimal(10,2) NOT NULL DEFAULT 0.40,
  `TAXA_PAGAMENTO_PERCENTUAL` decimal(5,2) NOT NULL DEFAULT 3.99,
  `TAXA_PAGAMENTO_MIN` decimal(5,2) NOT NULL DEFAULT 3.99,
  `TAXA_PAGAMENTO_MAX` decimal(5,2) NOT NULL DEFAULT 4.99,
  `TAXA_PAGAMENTO_ATIVA` tinyint(1) DEFAULT 1,
  `UPDATED_AT` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `UPDATED_BY` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `taxas_config`
--

INSERT INTO `taxas_config` (`CONFIG_ID`, `TAXA_SERVICO`, `TAXA_SERVICO_ATIVA`, `PSP_PROVIDER`, `TAXA_PAGAMENTO_FIXA`, `TAXA_PAGAMENTO_PERCENTUAL`, `TAXA_PAGAMENTO_MIN`, `TAXA_PAGAMENTO_MAX`, `TAXA_PAGAMENTO_ATIVA`, `UPDATED_AT`, `UPDATED_BY`) VALUES
(1, 0.99, 1, 'PagSeguro', 0.40, 3.99, 3.99, 4.99, 1, '2025-12-03 13:56:03', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `taxas_config_history`
--

CREATE TABLE `taxas_config_history` (
  `HISTORY_ID` int(11) NOT NULL,
  `TAXA_SERVICO` decimal(10,2) DEFAULT NULL,
  `TAXA_PAGAMENTO_FIXA` decimal(10,2) DEFAULT NULL,
  `TAXA_PAGAMENTO_PERCENTUAL` decimal(5,2) DEFAULT NULL,
  `PSP_PROVIDER` varchar(50) DEFAULT NULL,
  `CHANGED_BY` int(11) DEFAULT NULL,
  `CHANGED_AT` timestamp NOT NULL DEFAULT current_timestamp(),
  `REASON` text DEFAULT NULL,
  `OLD_VALUES` text DEFAULT NULL,
  `NEW_VALUES` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `taxas_exceptions`
--

CREATE TABLE `taxas_exceptions` (
  `EXCEPTION_ID` int(11) NOT NULL,
  `DELIVERY_ID` int(11) NOT NULL,
  `TAXA_SERVICO_CUSTOM` decimal(10,2) DEFAULT NULL,
  `TAXA_PAGAMENTO_FIXA_CUSTOM` decimal(10,2) DEFAULT NULL,
  `TAXA_PAGAMENTO_PERCENTUAL_CUSTOM` decimal(5,2) DEFAULT NULL,
  `REASON` text DEFAULT NULL,
  `ACTIVE` tinyint(1) DEFAULT 1,
  `CREATED_AT` timestamp NOT NULL DEFAULT current_timestamp(),
  `CREATED_BY` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `userlog`
--

CREATE TABLE `userlog` (
  `ID` int(11) NOT NULL,
  `USER_ID` int(11) NOT NULL,
  `IP_ADDRESS` varchar(45) NOT NULL,
  `DT_ACCESS` datetime NOT NULL,
  `TOKEN` varchar(240) NOT NULL,
  `EXPIRATION_TIME` datetime DEFAULT NULL,
  `CHV` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `userlog`
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
(66, 1002, '::1', '2025-12-02 09:41:52', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMi0wMiAwOTo0MTo1MiIsImNodiI6MSwiaWF0IjoxNzY0Njc5MzEyLCJleHAiOjE3NjQ2OTAxMTJ9.BbF_RNZkrVTDzM8DWqr8Cvxpmw5vYCGcAvwujGpsA8M', '2025-12-02 12:41:52', '1'),
(67, 1002, '201.17.208.30', '2025-12-04 15:12:08', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMi0wNCAxNToxMjowOCIsImNodiI6MSwiaWF0IjoxNzY0ODcxOTI4LCJleHAiOjE3NjQ4ODI3Mjh9.EhlobfYLDkA3SRTv6v0EeRTt1ZUjYaZ_4mgZKSP81U8', '2025-12-04 18:12:08', '1'),
(68, 1002, '201.17.157.61', '2025-12-05 11:41:44', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMi0wNSAxMTo0MTo0NCIsImNodiI6MSwiaWF0IjoxNzY0OTQ1NzA0LCJleHAiOjE3NjQ5NTY1MDR9.F-aCVumRK95MVJlJcWUNxH-W04tW_BuPadfNTOHUMwo', '2025-12-05 14:41:44', '1'),
(69, 1002, '201.17.157.61', '2025-12-05 15:44:13', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNS0xMi0wNSAxNTo0NDoxMyIsImNodiI6MSwiaWF0IjoxNzY0OTYwMjUzLCJleHAiOjE3NjQ5NzEwNTN9.d1yNaE_Xg999lC6w49syuE6MjZGMvtq30sy_1Wv0wmY', '2025-12-05 18:44:13', '1'),
(70, 100001, '201.17.157.61', '2026-01-06 20:13:00', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI2LTAxLTA2IDIwOjEzOjAwIiwiY2h2IjoxLCJpYXQiOjE3Njc3NDExODAsImV4cCI6MTc2Nzc1MTk4MH0.jptc-pS9EMpw8hRvFDjoChmiZ9fRejANTJ_qYvdEiQs', '2026-01-06 23:13:00', '1'),
(71, 100001, '201.17.157.61', '2026-01-06 20:16:13', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI2LTAxLTA2IDIwOjE2OjEzIiwiY2h2IjoxLCJpYXQiOjE3Njc3NDEzNzMsImV4cCI6MTc2Nzc1MjE3M30.nbcb62JAcBr5s2-bLFU-okTKMFO6J9q2UBEvhDJYlzU', '2026-01-06 23:16:13', '1'),
(72, 100001, '201.17.157.61', '2026-01-18 09:57:49', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI2LTAxLTE4IDA5OjU3OjQ5IiwiY2h2IjoxLCJpYXQiOjE3Njg3NDEwNjksImV4cCI6MTc2ODc1MTg2OX0.YiDpGIFIV-c2vRLmTCFJQfrFIWPVN8aRv8d3U3iNGrg', '2026-01-18 12:57:49', '1'),
(73, 1002, '201.17.157.61', '2026-02-04 08:27:36', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0wNCAwODoyNzozNiIsImNodiI6MSwiaWF0IjoxNzcwMjA0NDU2LCJleHAiOjE3NzAyMTUyNTZ9.GODpuRyloiv64n5fUzaij3ZZnCgsEJdxZ1LO8I_9gN8', '2026-02-04 11:27:36', '1'),
(74, 1002, '201.17.157.61', '2026-02-04 12:54:25', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0wNCAxMjo1NDoyNSIsImNodiI6MSwiaWF0IjoxNzcwMjIwNDY1LCJleHAiOjE3NzAyMzEyNjV9.ktxFa8bM4LUO4atRbXaGe6xu-l89UGLGBGITPct8VCY', '2026-02-04 15:54:25', '1'),
(75, 1002, '201.17.157.61', '2026-02-04 19:20:18', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0wNCAxOToyMDoxOCIsImNodiI6MSwiaWF0IjoxNzcwMjQzNjE4LCJleHAiOjE3NzAyNTQ0MTh9.OZXCEvoCUm0W15rOmwfYHaKIA0YvEy-1f05SLeq6yjk', '2026-02-04 22:20:18', '1'),
(76, 1002, '201.17.157.61', '2026-02-05 08:25:36', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0wNSAwODoyNTozNiIsImNodiI6MSwiaWF0IjoxNzcwMjkwNzM2LCJleHAiOjE3NzAzMDE1MzZ9.Ves9sHMNjmxJZKX2IePTIMdKD6kfSQ8-OnkwKO4vZug', '2026-02-05 11:25:36', '1'),
(77, 1002, '195.181.163.29', '2026-02-14 11:11:50', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNCAxMToxMTo1MCIsImNodiI6MSwiaWF0IjoxNzcxMDc4MzEwLCJleHAiOjE3NzEwODkxMTB9.Q-K0RAkCx5QP51l3Ds5UbFL9UxlOeQQbC9yfjRT5Ixc', '2026-02-14 14:11:50', '1'),
(78, 1002, '195.181.163.29', '2026-02-14 11:54:27', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNCAxMTo1NDoyNyIsImNodiI6MSwiaWF0IjoxNzcxMDgwODY3LCJleHAiOjE3NzEwOTE2Njd9.Y03cNxks_bpw_aJFy5tZNOUiI1Gm_f3I9J0B2VizFG0', '2026-02-14 14:54:27', '1'),
(79, 1002, '195.181.163.29', '2026-02-14 11:57:50', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNCAxMTo1Nzo1MCIsImNodiI6MSwiaWF0IjoxNzcxMDgxMDcwLCJleHAiOjE3NzEwOTE4NzB9.Gzbt8zvceDuoCPrjw_t2LtRSBhD1mcjUTnp6LpZY60I', '2026-02-14 14:57:50', '1'),
(80, 1002, '195.181.163.29', '2026-02-14 12:22:04', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNCAxMjoyMjowNCIsImNodiI6MSwiaWF0IjoxNzcxMDgyNTI0LCJleHAiOjE3NzEwOTMzMjR9.PpJorsNfC46OQO9fyaJDcx2BUOFf9ENUpGAUcez_ifk', '2026-02-14 15:22:04', '1'),
(81, 100001, '201.17.157.61', '2026-02-14 12:22:44', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI2LTAyLTE0IDEyOjIyOjQ0IiwiY2h2IjoxLCJpYXQiOjE3NzEwODI1NjQsImV4cCI6MTc3MTA5MzM2NH0.UYfXrHuxcdCjblZxYdZzk9-U-A0GNYP3oRPLTSj1s8M', '2026-02-14 15:22:44', '1'),
(82, 100001, '201.17.157.61', '2026-02-14 12:25:19', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI2LTAyLTE0IDEyOjI1OjE5IiwiY2h2IjoxLCJpYXQiOjE3NzEwODI3MTksImV4cCI6MTc3MTA5MzUxOX0.vcL6k7Q7yaXmu7fsyYMV4WCpDI1bctRHaUycp18UziE', '2026-02-14 15:25:19', '1'),
(83, 100001, '201.17.157.61', '2026-02-14 12:26:51', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI2LTAyLTE0IDEyOjI2OjUxIiwiY2h2IjoxLCJpYXQiOjE3NzEwODI4MTEsImV4cCI6MTc3MTA5MzYxMX0.yoorSdlCoFdqqS-b7Nlya1xyyI9apa26I6pBRrfkZB0', '2026-02-14 15:26:51', '1'),
(84, 100001, '201.17.157.61', '2026-02-14 12:28:53', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI2LTAyLTE0IDEyOjI4OjUzIiwiY2h2IjoxLCJpYXQiOjE3NzEwODI5MzMsImV4cCI6MTc3MTA5MzczM30.WgY98FMjZvrLSWD5lj0gaQf0v4xBJ5gstAQ8C1pd-c0', '2026-02-14 15:28:53', '1'),
(85, 1002, '195.181.163.29', '2026-02-14 13:29:56', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNCAxMzoyOTo1NiIsImNodiI6MSwiaWF0IjoxNzcxMDg2NTk2LCJleHAiOjE3NzEwOTczOTZ9.zkKHlT_nIhNVAjWw6sN39NgbMc16QguyDJP7dLJVTOA', '2026-02-14 16:29:56', '1'),
(86, 1002, '201.17.157.61', '2026-02-14 17:05:55', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNCAxNzowNTo1NSIsImNodiI6MSwiaWF0IjoxNzcxMDk5NTU1LCJleHAiOjE3NzExMTAzNTV9.TMlpm0xotr2CO-e1stgxr8m02ITleES83R6-6zDWmG4', '2026-02-14 20:05:55', '1'),
(87, 100001, '201.17.157.61', '2026-02-14 17:06:34', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI2LTAyLTE0IDE3OjA2OjM0IiwiY2h2IjoxLCJpYXQiOjE3NzEwOTk1OTQsImV4cCI6MTc3MTExMDM5NH0.QPoUKqSLLY2W67_1kJndqdFh_ThFV-FQFTjh5BXaoiE', '2026-02-14 20:06:34', '1'),
(88, 1002, '201.17.157.61', '2026-02-14 18:15:49', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNCAxODoxNTo0OSIsImNodiI6MSwiaWF0IjoxNzcxMTAzNzQ5LCJleHAiOjE3NzExMTQ1NDl9.EZm1zDS6LdE4OIF8n2l6bvtxqVN45he83uKt5iMhdC8', '2026-02-14 21:15:49', '1'),
(89, 1002, '201.17.157.61', '2026-02-14 19:36:54', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNCAxOTozNjo1NCIsImNodiI6MSwiaWF0IjoxNzcxMTA4NjE0LCJleHAiOjE3NzExMTk0MTR9.p2jIhSnYIfjxCCI7oGhMzyevDQG7VQRL53vBJJJH-8U', '2026-02-14 22:36:54', '1'),
(90, 1002, '201.17.157.61', '2026-02-14 20:40:00', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNCAyMDo0MDowMCIsImNodiI6MSwiaWF0IjoxNzcxMTEyNDAwLCJleHAiOjE3NzExMjMyMDB9.382yIrUYdIaT6MesUdcPulY3wRrbKS7RHcXxkO9YCss', '2026-02-14 23:40:00', '1'),
(91, 1002, '201.17.157.61', '2026-02-15 05:40:15', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNSAwNTo0MDoxNSIsImNodiI6MSwiaWF0IjoxNzcxMTQ0ODE1LCJleHAiOjE3NzExNTU2MTV9.K0UxRrXQf0Hoow6ASWOIGormFqYIaIOM5wqAibG23RQ', '2026-02-15 08:40:15', '1'),
(92, 1002, '201.17.157.61', '2026-02-15 13:34:57', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNSAxMzozNDo1NyIsImNodiI6MSwiaWF0IjoxNzcxMTczMjk3LCJleHAiOjE3NzExODQwOTd9.frS8iSRBGFSy1NM-1_LEjTgEJswXaG6itHV3HKD0GfQ', '2026-02-15 16:34:57', '1'),
(93, 1002, '201.17.157.61', '2026-02-16 16:10:17', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNiAxNjoxMDoxNyIsImNodiI6MSwiaWF0IjoxNzcxMjY5MDE3LCJleHAiOjE3NzEyNzk4MTd9.QHEYwXA2zk6lGTLxofdXpx-k08LuGeXg9My0IFYqw8c', '2026-02-16 19:10:17', '1'),
(94, 1002, '201.17.157.61', '2026-02-17 11:05:43', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNyAxMTowNTo0MyIsImNodiI6MSwiaWF0IjoxNzcxMzM3MTQzLCJleHAiOjE3NzEzNDc5NDN9.JA3F7s10agJ3QnRpBzz9aj9_bW_xIuoLJo_b_ty4lyU', '2026-02-17 14:05:43', '1'),
(95, 1002, '201.17.157.61', '2026-02-17 11:07:10', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xNyAxMTowNzoxMCIsImNodiI6MSwiaWF0IjoxNzcxMzM3MjMwLCJleHAiOjE3NzEzNDgwMzB9.hJVOBCzCTpfcCiizm4-2cbrVFZL4ry-oRCXyaOMW4cE', '2026-02-17 14:07:10', '1'),
(96, 1002, '201.17.157.61', '2026-02-18 18:27:34', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0xOCAxODoyNzozNCIsImNodiI6MSwiaWF0IjoxNzcxNDUwMDU0LCJleHAiOjE3NzE0NjA4NTR9.TbYsN8s2244itqVGuMe_mYh7CxxrutkD1liJaP6hsBI', '2026-02-18 21:27:34', '1'),
(97, 1002, '201.17.157.61', '2026-02-22 09:23:50', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0yMiAwOToyMzo1MCIsImNodiI6MSwiaWF0IjoxNzcxNzYzMDMwLCJleHAiOjE3NzE3NzM4MzB9.uHBVLPJN4NgkZPg7_oIVNXrlmYXsuZ75sjpjfWU-UiU', '2026-02-22 12:23:50', '1'),
(98, 1002, '201.17.157.61', '2026-02-22 11:13:43', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0yMiAxMToxMzo0MyIsImNodiI6MSwiaWF0IjoxNzcxNzY5NjIzLCJleHAiOjE3NzE3ODA0MjN9.Q-Rk1dhwOaoOkS4zF1qL3SruR5XlczD3c5uPmDGbmi8', '2026-02-22 14:13:43', '1'),
(99, 1002, '201.17.157.61', '2026-02-22 12:30:47', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0yMiAxMjozMDo0NyIsImNodiI6MSwiaWF0IjoxNzcxNzc0MjQ3LCJleHAiOjE3NzE3ODUwNDd9.DPT65e0GtL5Z2MIPvRCmQmsgj-_mow-hBhHeX3aQ5tw', '2026-02-22 15:30:47', '1'),
(100, 1002, '201.17.157.61', '2026-02-22 14:42:48', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMi0yMiAxNDo0Mjo0OCIsImNodiI6MSwiaWF0IjoxNzcxNzgyMTY4LCJleHAiOjE3NzE3OTI5Njh9.jqpfDADz4YJKGMmdy3y367vzAEcj73YHQ9Z1II5QBtE', '2026-02-22 17:42:48', '1'),
(101, 1002, '201.17.157.61', '2026-03-13 08:27:52', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wMy0xMyAwODoyNzo1MiIsImNodiI6MSwiaWF0IjoxNzczNDAxMjcyLCJleHAiOjE3NzM0MTIwNzJ9.tqNsACaGd6xTrt-9nzfmFu3aXE7OA-zqi1bDtTMe3Z4', '2026-03-13 11:27:52', '1'),
(102, 1002, '201.17.157.61', '2026-04-03 17:34:59', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wNC0wMyAxNzozNDo1OSIsImNodiI6MSwiaWF0IjoxNzc1MjQ4NDk5LCJleHAiOjE3NzUyNTkyOTl9.pd3bOBotI9kqj2aVW7-iWjkM-GBzm5-bgQ2YZD-w_Qo', '2026-04-03 20:34:59', '1'),
(103, 1002, '201.17.157.61', '2026-04-30 22:01:08', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wNC0zMCAyMjowMTowOCIsImNodiI6MSwiaWF0IjoxNzc3NTk3MjY4LCJleHAiOjE3Nzc2MDgwNjh9.1suuvBu28hwhVP3KIA-FDb9M1lamnTBFHp_pHK4kzTU', '2026-05-01 01:01:08', '1'),
(104, 1002, '201.17.157.61', '2026-05-05 08:26:58', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wNS0wNSAwODoyNjo1OCIsImNodiI6MSwiaWF0IjoxNzc3OTgwNDE4LCJleHAiOjE3Nzc5OTEyMTh9.rbB5RehVg0Z1nDIgg3vobT36KLv9J1_2Kklce_6UXtA', '2026-05-05 11:26:58', '1'),
(105, 1002, '201.17.157.61', '2026-07-06 20:05:18', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wNy0wNiAyMDowNToxOCIsImNodiI6MSwiaWF0IjoxNzgzMzc5MTE4LCJleHAiOjE3ODMzODk5MTh9.sIiGC1SaifaSVXPdoV0dVuexJpoUxSczObKswaPlHt8', '2026-07-06 23:05:18', '1'),
(106, 1002, '201.17.157.61', '2026-07-06 21:22:21', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wNy0wNiAyMToyMjoyMSIsImNodiI6MSwiaWF0IjoxNzgzMzgzNzQxLCJleHAiOjE3ODMzOTQ1NDF9.dlZ2KicBZRh6fV2r-zmL25R0FdZB3KszQRgkHXuKGmI', '2026-07-07 00:22:21', '1'),
(107, 1002, '201.17.157.61', '2026-07-15 05:46:37', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wNy0xNSAwNTo0NjozNyIsImNodiI6MSwiaWF0IjoxNzg0MTA1MTk4LCJleHAiOjE3ODQxMTU5OTh9.B-WbAfhVYLAstjV95TpzUi5zkqwdHFqGRQMGaBh7QeY', '2026-07-15 08:46:37', '1'),
(108, 1002, '201.17.157.61', '2026-07-15 20:28:11', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wNy0xNSAyMDoyODoxMSIsImNodiI6MSwiaWF0IjoxNzg0MTU4MDkxLCJleHAiOjE3ODQxNjg4OTF9.t-RQGTTbL4PdPrzRLjqnZARg5Rn1yDp529kKOXUp24o', '2026-07-15 23:28:11', '1'),
(109, 1002, '201.17.188.224', '2026-07-21 15:31:24', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wNy0yMSAxNTozMToyNCIsImNodiI6MSwiaWF0IjoxNzg0NjU4Njg0LCJleHAiOjE3ODQ2Njk0ODR9.Oogx1c8OHoflvAJb_CXC5NbKOLPRsGtp2mJLk2djOVo', '2026-07-21 18:31:24', '1'),
(110, 100001, '138.117.205.71', '2026-08-08 17:54:08', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI2LTA4LTA4IDE3OjU0OjA4IiwiY2h2IjoxLCJpYXQiOjE3ODYyMjI0NDgsImV4cCI6MTc4NjIzMzI0OH0.CjVsXKymksW0AV4ZL78DSAFGnNsh4l4B0F6TNqbzjt8', '2026-08-08 20:54:08', '1'),
(111, 1002, '138.117.205.71', '2026-08-08 17:59:37', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wOC0wOCAxNzo1OTozNyIsImNodiI6MSwiaWF0IjoxNzg2MjIyNzc3LCJleHAiOjE3ODYyMzM1Nzd9.BlQsojBQUeQ33m5Ut_Me44Gt89K4Ol2ddiCvFVh83FE', '2026-08-08 20:59:37', '1'),
(112, 1002, '138.117.205.71', '2026-08-08 18:05:34', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wOC0wOCAxODowNTozNCIsImNodiI6MSwiaWF0IjoxNzg2MjIzMTM0LCJleHAiOjE3ODYyMzM5MzR9.v3TrmC-iR-9I3jo0ISusAmk4MB03DEYMs07pC5Ivvhc', '2026-08-08 21:05:34', '1'),
(113, 1006, '138.117.205.71', '2026-08-08 18:42:59', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwNiwiZHRfYWNjZXNzIjoiMjAyNi0wOC0wOCAxODo0Mjo1OSIsImNodiI6MSwiaWF0IjoxNzg2MjI1Mzc5LCJleHAiOjE3ODYyMzYxNzl9.6BrNmnCxkmEKGclFhOoOVfmLlV1_IK9WAZza6ONVypM', '2026-08-08 21:42:59', '1'),
(114, 1006, '138.117.205.71', '2026-08-08 18:52:56', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwNiwiZHRfYWNjZXNzIjoiMjAyNi0wOC0wOCAxODo1Mjo1NiIsImNodiI6MSwiaWF0IjoxNzg2MjI1OTc2LCJleHAiOjE3ODYyMzY3NzZ9.sl_qxkAVLirDDFaO6Mj9iCKiL_ZP2H2pV5ahqzI8bo8', '2026-08-08 21:52:56', '1'),
(115, 1006, '138.117.205.71', '2026-08-08 18:58:12', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwNiwiZHRfYWNjZXNzIjoiMjAyNi0wOC0wOCAxODo1ODoxMiIsImNodiI6MSwiaWF0IjoxNzg2MjI2MjkyLCJleHAiOjE3ODYyMzcwOTJ9.vlsa5DtwQFbxjvfJDD-qJVzB1LmrH2kQS6VB0jexgVc', '2026-08-08 21:58:12', '1'),
(116, 1002, '138.117.205.71', '2026-08-08 19:24:35', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wOC0wOCAxOToyNDozNSIsImNodiI6MSwiaWF0IjoxNzg2MjI3ODc1LCJleHAiOjE3ODYyMzg2NzV9.d1z0owvTRLCl_RiNHzYWPcZTqomLH_-hZ8GsE-HITV0', '2026-08-08 22:24:35', '1'),
(117, 100001, '138.117.205.71', '2026-08-08 20:23:58', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAxLCJkdF9hY2Nlc3MiOiIyMDI2LTA4LTA4IDIwOjIzOjU4IiwiY2h2IjoxLCJpYXQiOjE3ODYyMzE0MzgsImV4cCI6MTc4NjI0MjIzOH0.PA22oitDjX2wP2pl8_PQ0O_D1qNgBX7cBYX3-_sU3r4', '2026-08-08 23:23:58', '1'),
(118, 1002, '201.17.188.224', '2026-09-08 15:51:56', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0wOS0wOCAxNTo1MTo1NiIsImNodiI6MSwiaWF0IjoxNzg4ODkzNTE2LCJleHAiOjE3ODg5MDQzMTZ9.DEcBbrV3cKQFYRKLixjiP4RqfOb3EN3_CCzdM3bLRDI', '2026-09-08 18:51:56', '1'),
(119, 1006, '201.17.157.97', '2026-11-03 12:12:44', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwNiwiZHRfYWNjZXNzIjoiMjAyNi0xMS0wMyAxMjoxMjo0NCIsImNodiI6MSwiaWF0IjoxNzkzNzE4NzY0LCJleHAiOjE3OTM3Mjk1NjR9.2ln8fPFqAkZMtoFmIZY3RBc3e8-7uovbU60pyR0XdM0', '2026-11-03 15:12:44', '1'),
(120, 1002, '201.17.157.97', '2026-11-03 12:13:26', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMiwiZHRfYWNjZXNzIjoiMjAyNi0xMS0wMyAxMjoxMzoyNiIsImNodiI6MSwiaWF0IjoxNzkzNzE4ODA2LCJleHAiOjE3OTM3Mjk2MDZ9.des1RVwDQv2ExCVbDeS5CwFCx0mjau35l9UwSGCOUfQ', '2026-11-03 15:13:26', '1');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `USER_ID` int(11) NOT NULL,
  `NOME` varchar(60) NOT NULL,
  `SOBRENOME` varchar(60) NOT NULL,
  `TELEFONE` varchar(18) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `PASSWORD` varchar(240) NOT NULL,
  `URL_IMAGEM` varchar(240) NOT NULL,
  `CHV` varchar(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`USER_ID`, `NOME`, `SOBRENOME`, `TELEFONE`, `EMAIL`, `PASSWORD`, `URL_IMAGEM`, `CHV`) VALUES
(100001, 'Ezequias', 'Martins', '(31) 98410-7540', 'ezequiasmartins@gmail.com', '*1A030512019B7B4B97167D5515EBB6C7105EB12F', '', '0'),
(100002, 'Zé', 'das Couves', '(31) 98410-0000', 'zedascouves@email.com', '*3522E3A7EDC4BD06F7952ACA8D71D5B393A58D7E', '', '1');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`ADMIN_ID`),
  ADD UNIQUE KEY `USER_EMAIL` (`USER_EMAIL`),
  ADD KEY `idx_email` (`USER_EMAIL`);

--
-- Índices de tabela `auth_password_resets`
--
ALTER TABLE `auth_password_resets`
  ADD PRIMARY KEY (`RESET_ID`),
  ADD UNIQUE KEY `uq_auth_password_resets_account` (`ACCOUNT_TYPE`,`ACCOUNT_ID`),
  ADD KEY `idx_auth_password_resets_email` (`EMAIL`),
  ADD KEY `idx_auth_password_resets_expiration` (`EXPIRES_AT`);

--
-- Índices de tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`CATEGORIA_ID`);

--
-- Índices de tabela `couriers`
--
ALTER TABLE `couriers`
  ADD PRIMARY KEY (`COURIER_ID`);

--
-- Índices de tabela `deliveries`
--
ALTER TABLE `deliveries`
  ADD PRIMARY KEY (`DELIVERY_ID`);

--
-- Índices de tabela `extras`
--
ALTER TABLE `extras`
  ADD PRIMARY KEY (`EXTRA_ID`);

--
-- Índices de tabela `itens`
--
ALTER TABLE `itens`
  ADD PRIMARY KEY (`ITEM_ID`),
  ADD KEY `id_pedido` (`PEDIDO_ID`),
  ADD KEY `id_produto` (`PRODUTO_ID`);

--
-- Índices de tabela `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`PEDIDO_ID`),
  ADD KEY `id_usuario` (`USER_ID`);

--
-- Índices de tabela `pix_transactions`
--
ALTER TABLE `pix_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `txid` (`txid`),
  ADD KEY `idx_txid` (`txid`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`PRODUTO_ID`),
  ADD KEY `CategoriaID` (`DELIVERY_ID`);

--
-- Índices de tabela `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`LOG_ID`),
  ADD KEY `fk_log_admin` (`ADMIN_ID`),
  ADD KEY `idx_action` (`ACTION`),
  ADD KEY `idx_entity` (`ENTITY_TYPE`,`ENTITY_ID`),
  ADD KEY `idx_created` (`CREATED_AT`);

--
-- Índices de tabela `taxa`
--
ALTER TABLE `taxa`
  ADD PRIMARY KEY (`TAXA_ID`);

--
-- Índices de tabela `taxas_config`
--
ALTER TABLE `taxas_config`
  ADD PRIMARY KEY (`CONFIG_ID`),
  ADD KEY `fk_taxas_admin` (`UPDATED_BY`);

--
-- Índices de tabela `taxas_config_history`
--
ALTER TABLE `taxas_config_history`
  ADD PRIMARY KEY (`HISTORY_ID`),
  ADD KEY `fk_history_admin` (`CHANGED_BY`),
  ADD KEY `idx_changed_at` (`CHANGED_AT`);

--
-- Índices de tabela `taxas_exceptions`
--
ALTER TABLE `taxas_exceptions`
  ADD PRIMARY KEY (`EXCEPTION_ID`),
  ADD KEY `fk_exception_delivery` (`DELIVERY_ID`),
  ADD KEY `fk_exception_admin` (`CREATED_BY`),
  ADD KEY `idx_active` (`ACTIVE`);

--
-- Índices de tabela `userlog`
--
ALTER TABLE `userlog`
  ADD PRIMARY KEY (`ID`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`USER_ID`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `ADMIN_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `auth_password_resets`
--
ALTER TABLE `auth_password_resets`
  MODIFY `RESET_ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `CATEGORIA_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT de tabela `couriers`
--
ALTER TABLE `couriers`
  MODIFY `COURIER_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=200003;

--
-- AUTO_INCREMENT de tabela `deliveries`
--
ALTER TABLE `deliveries`
  MODIFY `DELIVERY_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1021;

--
-- AUTO_INCREMENT de tabela `extras`
--
ALTER TABLE `extras`
  MODIFY `EXTRA_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de tabela `itens`
--
ALTER TABLE `itens`
  MODIFY `ITEM_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=137;

--
-- AUTO_INCREMENT de tabela `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `PEDIDO_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1099;

--
-- AUTO_INCREMENT de tabela `pix_transactions`
--
ALTER TABLE `pix_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `PRODUTO_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1072;

--
-- AUTO_INCREMENT de tabela `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `LOG_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `taxa`
--
ALTER TABLE `taxa`
  MODIFY `TAXA_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `taxas_config`
--
ALTER TABLE `taxas_config`
  MODIFY `CONFIG_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `taxas_config_history`
--
ALTER TABLE `taxas_config_history`
  MODIFY `HISTORY_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `taxas_exceptions`
--
ALTER TABLE `taxas_exceptions`
  MODIFY `EXCEPTION_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `userlog`
--
ALTER TABLE `userlog`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `USER_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100003;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `system_logs`
--
ALTER TABLE `system_logs`
  ADD CONSTRAINT `fk_log_admin` FOREIGN KEY (`ADMIN_ID`) REFERENCES `admin_users` (`ADMIN_ID`) ON DELETE SET NULL;

--
-- Restrições para tabelas `taxas_config`
--
ALTER TABLE `taxas_config`
  ADD CONSTRAINT `fk_taxas_admin` FOREIGN KEY (`UPDATED_BY`) REFERENCES `admin_users` (`ADMIN_ID`) ON DELETE SET NULL;

--
-- Restrições para tabelas `taxas_config_history`
--
ALTER TABLE `taxas_config_history`
  ADD CONSTRAINT `fk_history_admin` FOREIGN KEY (`CHANGED_BY`) REFERENCES `admin_users` (`ADMIN_ID`) ON DELETE SET NULL;

--
-- Restrições para tabelas `taxas_exceptions`
--
ALTER TABLE `taxas_exceptions`
  ADD CONSTRAINT `fk_exception_admin` FOREIGN KEY (`CREATED_BY`) REFERENCES `admin_users` (`ADMIN_ID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_exception_delivery` FOREIGN KEY (`DELIVERY_ID`) REFERENCES `deliveries` (`DELIVERY_ID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
