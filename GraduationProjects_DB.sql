-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: GraduationProjects_DB
-- ------------------------------------------------------
-- Server version	10.6.23-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account_emailaddress`
--

DROP TABLE IF EXISTS `account_emailaddress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account_emailaddress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `verified` tinyint(1) NOT NULL,
  `primary` tinyint(1) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_emailaddress_user_id_email_987c8728_uniq` (`user_id`,`email`),
  KEY `account_emailaddress_email_03be32b2` (`email`),
  CONSTRAINT `account_emailaddress_user_id_2c513194_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_emailaddress`
--

LOCK TABLES `account_emailaddress` WRITE;
/*!40000 ALTER TABLE `account_emailaddress` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_emailaddress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_emailconfirmation`
--

DROP TABLE IF EXISTS `account_emailconfirmation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account_emailconfirmation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created` datetime(6) NOT NULL,
  `sent` datetime(6) DEFAULT NULL,
  `key` varchar(64) NOT NULL,
  `email_address_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `account_emailconfirm_email_address_id_5b7f8c58_fk_account_e` (`email_address_id`),
  CONSTRAINT `account_emailconfirm_email_address_id_5b7f8c58_fk_account_e` FOREIGN KEY (`email_address_id`) REFERENCES `account_emailaddress` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_emailconfirmation`
--

LOCK TABLES `account_emailconfirmation` WRITE;
/*!40000 ALTER TABLE `account_emailconfirmation` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_emailconfirmation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add college',1,'add_college'),(2,'Can change college',1,'change_college'),(3,'Can delete college',1,'delete_college'),(4,'Can view college',1,'view_college'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add project',3,'add_project'),(10,'Can change project',3,'change_project'),(11,'Can delete project',3,'delete_project'),(12,'Can view project',3,'view_project'),(13,'Can add role',4,'add_role'),(14,'Can change role',4,'change_role'),(15,'Can delete role',4,'delete_role'),(16,'Can view role',4,'view_role'),(17,'Can add university',5,'add_university'),(18,'Can change university',5,'change_university'),(19,'Can delete university',5,'delete_university'),(20,'Can view university',5,'view_university'),(21,'Can add user',6,'add_user'),(22,'Can change user',6,'change_user'),(23,'Can delete user',6,'delete_user'),(24,'Can view user',6,'view_user'),(25,'Can add department',7,'add_department'),(26,'Can change department',7,'change_department'),(27,'Can delete department',7,'delete_department'),(28,'Can view department',7,'view_department'),(29,'Can add notification',8,'add_notification'),(30,'Can change notification',8,'change_notification'),(31,'Can delete notification',8,'delete_notification'),(32,'Can view notification',8,'view_notification'),(33,'Can add group',9,'add_group'),(34,'Can change group',9,'change_group'),(35,'Can delete group',9,'delete_group'),(36,'Can view group',9,'view_group'),(37,'Can add group members',10,'add_groupmembers'),(38,'Can change group members',10,'change_groupmembers'),(39,'Can delete group members',10,'delete_groupmembers'),(40,'Can view group members',10,'view_groupmembers'),(41,'Can add group supervisors',11,'add_groupsupervisors'),(42,'Can change group supervisors',11,'change_groupsupervisors'),(43,'Can delete group supervisors',11,'delete_groupsupervisors'),(44,'Can view group supervisors',11,'view_groupsupervisors'),(45,'Can add role permission',12,'add_rolepermission'),(46,'Can change role permission',12,'change_rolepermission'),(47,'Can delete role permission',12,'delete_rolepermission'),(48,'Can view role permission',12,'view_rolepermission'),(49,'Can add academic affiliation',13,'add_academicaffiliation'),(50,'Can change academic affiliation',13,'change_academicaffiliation'),(51,'Can delete academic affiliation',13,'delete_academicaffiliation'),(52,'Can view academic affiliation',13,'view_academicaffiliation'),(53,'Can add user roles',14,'add_userroles'),(54,'Can change user roles',14,'change_userroles'),(55,'Can delete user roles',14,'delete_userroles'),(56,'Can view user roles',14,'view_userroles'),(57,'Can add log entry',15,'add_logentry'),(58,'Can change log entry',15,'change_logentry'),(59,'Can delete log entry',15,'delete_logentry'),(60,'Can view log entry',15,'view_logentry'),(61,'Can add permission',16,'add_permission'),(62,'Can change permission',16,'change_permission'),(63,'Can delete permission',16,'delete_permission'),(64,'Can view permission',16,'view_permission'),(65,'Can add group',17,'add_group'),(66,'Can change group',17,'change_group'),(67,'Can delete group',17,'delete_group'),(68,'Can view group',17,'view_group'),(69,'Can add content type',18,'add_contenttype'),(70,'Can change content type',18,'change_contenttype'),(71,'Can delete content type',18,'delete_contenttype'),(72,'Can view content type',18,'view_contenttype'),(73,'Can add session',19,'add_session'),(74,'Can change session',19,'change_session'),(75,'Can delete session',19,'delete_session'),(76,'Can view session',19,'view_session'),(77,'Can add city',20,'add_city'),(78,'Can change city',20,'change_city'),(79,'Can delete city',20,'delete_city'),(80,'Can view city',20,'view_city'),(81,'Can add program',21,'add_program'),(82,'Can change program',21,'change_program'),(83,'Can delete program',21,'delete_program'),(84,'Can view program',21,'view_program'),(85,'Can add branch',22,'add_branch'),(86,'Can change branch',22,'change_branch'),(87,'Can delete branch',22,'delete_branch'),(88,'Can view branch',22,'view_branch'),(89,'Can add system settings',23,'add_systemsettings'),(90,'Can change system settings',23,'change_systemsettings'),(91,'Can delete system settings',23,'delete_systemsettings'),(92,'Can view system settings',23,'view_systemsettings'),(93,'Can add approval request',24,'add_approvalrequest'),(94,'Can change approval request',24,'change_approvalrequest'),(95,'Can delete approval request',24,'delete_approvalrequest'),(96,'Can view approval request',24,'view_approvalrequest'),(97,'Can add notification log',25,'add_notificationlog'),(98,'Can change notification log',25,'change_notificationlog'),(99,'Can delete notification log',25,'delete_notificationlog'),(100,'Can view notification log',25,'view_notificationlog'),(101,'Can add approval sequence',26,'add_approvalsequence'),(102,'Can change approval sequence',26,'change_approvalsequence'),(103,'Can delete approval sequence',26,'delete_approvalsequence'),(104,'Can view approval sequence',26,'view_approvalsequence'),(105,'Can add group invitation',27,'add_groupinvitation'),(106,'Can change group invitation',27,'change_groupinvitation'),(107,'Can delete group invitation',27,'delete_groupinvitation'),(108,'Can view group invitation',27,'view_groupinvitation'),(109,'Can add site',28,'add_site'),(110,'Can change site',28,'change_site'),(111,'Can delete site',28,'delete_site'),(112,'Can view site',28,'view_site'),(113,'Can add Token',29,'add_token'),(114,'Can change Token',29,'change_token'),(115,'Can delete Token',29,'delete_token'),(116,'Can view Token',29,'view_token'),(117,'Can add Token',30,'add_tokenproxy'),(118,'Can change Token',30,'change_tokenproxy'),(119,'Can delete Token',30,'delete_tokenproxy'),(120,'Can view Token',30,'view_tokenproxy'),(121,'Can add email address',31,'add_emailaddress'),(122,'Can change email address',31,'change_emailaddress'),(123,'Can delete email address',31,'delete_emailaddress'),(124,'Can view email address',31,'view_emailaddress'),(125,'Can add email confirmation',32,'add_emailconfirmation'),(126,'Can change email confirmation',32,'change_emailconfirmation'),(127,'Can delete email confirmation',32,'delete_emailconfirmation'),(128,'Can view email confirmation',32,'view_emailconfirmation'),(129,'Can add social account',33,'add_socialaccount'),(130,'Can change social account',33,'change_socialaccount'),(131,'Can delete social account',33,'delete_socialaccount'),(132,'Can view social account',33,'view_socialaccount'),(133,'Can add social application',34,'add_socialapp'),(134,'Can change social application',34,'change_socialapp'),(135,'Can delete social application',34,'delete_socialapp'),(136,'Can view social application',34,'view_socialapp'),(137,'Can add social application token',35,'add_socialtoken'),(138,'Can change social application token',35,'change_socialtoken'),(139,'Can delete social application token',35,'delete_socialtoken'),(140,'Can view social application token',35,'view_socialtoken'),(141,'Can add group creation request',36,'add_groupcreationrequest'),(142,'Can change group creation request',36,'change_groupcreationrequest'),(143,'Can delete group creation request',36,'delete_groupcreationrequest'),(144,'Can view group creation request',36,'view_groupcreationrequest'),(145,'Can add group member approval',37,'add_groupmemberapproval'),(146,'Can change group member approval',37,'change_groupmemberapproval'),(147,'Can delete group member approval',37,'delete_groupmemberapproval'),(148,'Can view group member approval',37,'view_groupmemberapproval'),(149,'Can add progress pattern',38,'add_progresspattern'),(150,'Can change progress pattern',38,'change_progresspattern'),(151,'Can delete progress pattern',38,'delete_progresspattern'),(152,'Can view progress pattern',38,'view_progresspattern'),(153,'Can add department progress pattern',39,'add_departmentprogresspattern'),(154,'Can change department progress pattern',39,'change_departmentprogresspattern'),(155,'Can delete department progress pattern',39,'delete_departmentprogresspattern'),(156,'Can view department progress pattern',39,'view_departmentprogresspattern'),(157,'Can add college progress pattern',40,'add_collegeprogresspattern'),(158,'Can change college progress pattern',40,'change_collegeprogresspattern'),(159,'Can delete college progress pattern',40,'delete_collegeprogresspattern'),(160,'Can view college progress pattern',40,'view_collegeprogresspattern'),(161,'Can add progress stage',41,'add_progressstage'),(162,'Can change progress stage',41,'change_progressstage'),(163,'Can delete progress stage',41,'delete_progressstage'),(164,'Can view progress stage',41,'view_progressstage'),(165,'Can add pattern stage assignment',42,'add_patternstageassignment'),(166,'Can change pattern stage assignment',42,'change_patternstageassignment'),(167,'Can delete pattern stage assignment',42,'delete_patternstageassignment'),(168,'Can view pattern stage assignment',42,'view_patternstageassignment'),(169,'Can add progress sub stage',43,'add_progresssubstage'),(170,'Can change progress sub stage',43,'change_progresssubstage'),(171,'Can delete progress sub stage',43,'delete_progresssubstage'),(172,'Can view progress sub stage',43,'view_progresssubstage'),(173,'Can add pattern sub stage assignment',44,'add_patternsubstageassignment'),(174,'Can change pattern sub stage assignment',44,'change_patternsubstageassignment'),(175,'Can delete pattern sub stage assignment',44,'delete_patternsubstageassignment'),(176,'Can view pattern sub stage assignment',44,'view_patternsubstageassignment'),(177,'Can add student progress',45,'add_studentprogress'),(178,'Can change student progress',45,'change_studentprogress'),(179,'Can delete student progress',45,'delete_studentprogress'),(180,'Can view student progress',45,'view_studentprogress');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authtoken_token`
--

DROP TABLE IF EXISTS `authtoken_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `authtoken_token_user_id_35299eff_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authtoken_token`
--

LOCK TABLES `authtoken_token` WRITE;
/*!40000 ALTER TABLE `authtoken_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `authtoken_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_academicaffiliation`
--

DROP TABLE IF EXISTS `core_academicaffiliation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_academicaffiliation` (
  `affiliation_id` int(11) NOT NULL AUTO_INCREMENT,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  `university_id` int(11) NOT NULL,
  `college_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`affiliation_id`),
  UNIQUE KEY `core_academicaffiliation_user_id_univer_id_start__84aec2c9_uniq` (`user_id`,`university_id`,`start_date`),
  KEY `core_academicaffiliation_college_id_04cf1d13_fk_core_college_cid` (`college_id`),
  KEY `core_academicaffilia_department_id_e3498b06_fk_core_depa` (`department_id`),
  KEY `core_academicaffilia_university_id_eb968439_fk_core_univ` (`university_id`),
  CONSTRAINT `core_academicaffilia_department_id_e3498b06_fk_core_depa` FOREIGN KEY (`department_id`) REFERENCES `core_department` (`department_id`),
  CONSTRAINT `core_academicaffilia_university_id_eb968439_fk_core_univ` FOREIGN KEY (`university_id`) REFERENCES `core_university` (`uid`),
  CONSTRAINT `core_academicaffiliation_college_id_04cf1d13_fk_core_college_cid` FOREIGN KEY (`college_id`) REFERENCES `core_college` (`cid`),
  CONSTRAINT `core_academicaffiliation_user_id_e1de4333_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_academicaffiliation`
--

LOCK TABLES `core_academicaffiliation` WRITE;
/*!40000 ALTER TABLE `core_academicaffiliation` DISABLE KEYS */;
INSERT INTO `core_academicaffiliation` VALUES (1,'2023-05-11','2025-12-04',2,1,3,3),(2,'2025-12-09',NULL,3,1,3,3),(3,'2025-12-09',NULL,14,1,3,4),(4,'2025-12-09',NULL,5,1,3,3),(5,'2025-12-09',NULL,4,1,3,3),(7,'2025-12-09',NULL,12,1,3,3),(8,'2025-12-09',NULL,21,1,3,NULL),(9,'2025-12-09',NULL,22,3,NULL,NULL),(10,'2025-12-09',NULL,7,1,3,3),(11,'2025-12-09',NULL,18,1,NULL,NULL),(12,'2025-12-09',NULL,13,1,3,3),(13,'2025-12-09',NULL,6,1,3,6),(14,'2025-12-09',NULL,20,1,3,4),(15,'2025-12-09',NULL,25,1,NULL,NULL),(16,'2025-12-10',NULL,16,1,NULL,NULL),(17,'2025-12-11',NULL,11,1,3,NULL);
/*!40000 ALTER TABLE `core_academicaffiliation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_approvalrequest`
--

DROP TABLE IF EXISTS `core_approvalrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_approvalrequest` (
  `approval_id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `comments` longtext DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `requested_by_id` bigint(20) NOT NULL,
  `approval_level` int(11) NOT NULL,
  `approval_type` varchar(50) DEFAULT NULL,
  `approved_at` datetime(6) DEFAULT NULL,
  `current_approver_id` bigint(20) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`approval_id`),
  KEY `core_approvalrequest_requested_by_id_f1139fd6_fk_core_user_id` (`requested_by_id`),
  KEY `core_approvalrequest_current_approver_id_f642b97d_fk_core_user` (`current_approver_id`),
  KEY `core_approvalrequest_project_id_753625f8_fk_core_proj` (`project_id`),
  KEY `core_approvalrequest_group_id_73052ee0_fk_core_group_group_id` (`group_id`),
  CONSTRAINT `core_approvalrequest_current_approver_id_f642b97d_fk_core_user` FOREIGN KEY (`current_approver_id`) REFERENCES `core_user` (`id`),
  CONSTRAINT `core_approvalrequest_group_id_73052ee0_fk_core_group_group_id` FOREIGN KEY (`group_id`) REFERENCES `core_group` (`group_id`),
  CONSTRAINT `core_approvalrequest_project_id_753625f8_fk_core_proj` FOREIGN KEY (`project_id`) REFERENCES `core_project` (`project_id`),
  CONSTRAINT `core_approvalrequest_requested_by_id_f1139fd6_fk_core_user_id` FOREIGN KEY (`requested_by_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_approvalrequest`
--

LOCK TABLES `core_approvalrequest` WRITE;
/*!40000 ALTER TABLE `core_approvalrequest` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_approvalrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_approvalsequence`
--

DROP TABLE IF EXISTS `core_approvalsequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_approvalsequence` (
  `sequence_id` int(11) NOT NULL AUTO_INCREMENT,
  `approval_levels` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`approval_levels`)),
  `description` longtext DEFAULT NULL,
  `sequence_type` varchar(50) DEFAULT NULL,
  `assigned_at` datetime(6) DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`sequence_id`),
  UNIQUE KEY `sequence_type` (`sequence_type`),
  UNIQUE KEY `core_approvalsequence_group_id_project_id_8129418a_uniq` (`group_id`,`project_id`),
  KEY `core_approvalsequenc_project_id_5de514f7_fk_core_proj` (`project_id`),
  CONSTRAINT `core_approvalsequenc_project_id_5de514f7_fk_core_proj` FOREIGN KEY (`project_id`) REFERENCES `core_project` (`project_id`),
  CONSTRAINT `core_approvalsequence_group_id_a539623e_fk_core_group_group_id` FOREIGN KEY (`group_id`) REFERENCES `core_group` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_approvalsequence`
--

LOCK TABLES `core_approvalsequence` WRITE;
/*!40000 ALTER TABLE `core_approvalsequence` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_approvalsequence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_branch`
--

DROP TABLE IF EXISTS `core_branch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_branch` (
  `ubid` int(11) NOT NULL AUTO_INCREMENT,
  `location` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `city_id` int(11) NOT NULL,
  `university_id` int(11) NOT NULL,
  PRIMARY KEY (`ubid`),
  UNIQUE KEY `core_branch_UID_BID_40515c6c_uniq` (`university_id`,`city_id`),
  KEY `core_branch_city_id_6e1ef5eb_fk_core_city_bid` (`city_id`),
  CONSTRAINT `core_branch_city_id_6e1ef5eb_fk_core_city_bid` FOREIGN KEY (`city_id`) REFERENCES `core_city` (`bid`),
  CONSTRAINT `core_branch_university_id_729a80f9_fk_core_university_uid` FOREIGN KEY (`university_id`) REFERENCES `core_university` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_branch`
--

LOCK TABLES `core_branch` WRITE;
/*!40000 ALTER TABLE `core_branch` DISABLE KEYS */;
INSERT INTO `core_branch` VALUES (1,NULL,NULL,NULL,3,1),(2,NULL,NULL,NULL,5,2),(3,NULL,NULL,NULL,6,3),(4,NULL,NULL,NULL,9,6),(5,NULL,NULL,NULL,10,7),(6,NULL,NULL,NULL,12,9),(7,NULL,NULL,NULL,13,10),(8,NULL,NULL,NULL,14,11),(9,NULL,NULL,NULL,15,12),(10,NULL,NULL,NULL,18,13),(11,NULL,NULL,NULL,17,14),(12,NULL,NULL,NULL,4,15),(13,NULL,NULL,NULL,4,16),(14,NULL,NULL,NULL,4,1),(15,NULL,NULL,NULL,4,19),(16,NULL,NULL,NULL,4,18),(17,NULL,NULL,NULL,4,17);
/*!40000 ALTER TABLE `core_branch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_city`
--

DROP TABLE IF EXISTS `core_city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_city` (
  `bid` int(11) NOT NULL AUTO_INCREMENT,
  `bname_ar` varchar(255) NOT NULL,
  `bname_en` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`bid`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_city`
--

LOCK TABLES `core_city` WRITE;
/*!40000 ALTER TABLE `core_city` DISABLE KEYS */;
INSERT INTO `core_city` VALUES (2,'sana\'a',NULL),(3,'╪ث┘à╪د┘╪ر ╪د┘╪╣╪د╪╡┘à╪ر',NULL),(4,'╪╡┘╪╣╪د╪ة',NULL),(5,'╪د┘╪ص╪»┘è╪»╪ر',NULL),(6,'╪ز╪╣╪▓',NULL),(7,'╪ح╪ذ',NULL),(8,'╪░┘à╪د╪▒',NULL),(9,'╪╣╪»┘',NULL),(10,'╪ص╪╢╪▒┘à┘ê╪ز',NULL),(11,'┘à╪ث╪▒╪ذ',NULL),(12,'╪ص╪ش╪ر',NULL),(13,'╪د┘╪ذ┘è╪╢╪د╪ة',NULL),(14,'╪╣┘à╪▒╪د┘',NULL),(15,'╪╡╪╣╪»╪ر',NULL),(16,'╪د┘╪ش┘ê┘',NULL),(17,'╪د┘┘à╪ص┘ê┘è╪ز',NULL),(18,'╪د┘╪╢╪د┘╪╣',NULL),(19,'╪┤╪ذ┘ê╪ر',NULL),(20,'┘╪ص╪ش',NULL),(21,'╪ث╪ذ┘è┘',NULL),(22,'╪▒┘è┘à╪ر',NULL);
/*!40000 ALTER TABLE `core_city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_college`
--

DROP TABLE IF EXISTS `core_college`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_college` (
  `cid` int(11) NOT NULL AUTO_INCREMENT,
  `name_ar` varchar(255) NOT NULL,
  `name_en` varchar(255) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`cid`),
  KEY `core_college_branch_id_bd55f3f3_fk_core_branch_ubid` (`branch_id`),
  CONSTRAINT `core_college_branch_id_bd55f3f3_fk_core_branch_ubid` FOREIGN KEY (`branch_id`) REFERENCES `core_branch` (`ubid`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_college`
--

LOCK TABLES `core_college` WRITE;
/*!40000 ALTER TABLE `core_college` DISABLE KEYS */;
INSERT INTO `core_college` VALUES (1,'┘â┘┘è╪ر ╪د┘╪ز╪ش╪د╪▒╪ر ┘ê╪د┘╪د┘é╪ز╪╡╪د╪»',NULL,1),(2,'┘â┘┘è╪ر ╪د┘╪ز╪▒╪ذ┘è╪ر ╪╡┘╪╣╪د╪ة',NULL,1),(3,'┘â┘┘è╪ر ╪د┘╪ص╪د╪│┘ê╪ذ',NULL,1),(4,'┘â┘┘è╪ر ╪د┘┘ç┘╪»╪│╪ر',NULL,2),(5,'┘â┘┘è╪ر ╪د┘╪ص╪د╪│┘ê╪ذ',NULL,3),(6,'┘â┘┘è╪ر ╪د┘┘ç┘╪»╪│╪ر',NULL,1);
/*!40000 ALTER TABLE `core_college` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_collegeprogresspattern`
--

DROP TABLE IF EXISTS `core_collegeprogresspattern`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_collegeprogresspattern` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `is_default` tinyint(1) NOT NULL,
  `assigned_at` datetime(6) NOT NULL,
  `college_id` int(11) NOT NULL,
  `pattern_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_collegeprogresspattern_college_id_pattern_id_f6ba5a3c_uniq` (`college_id`,`pattern_id`),
  KEY `core_collegeprogress_pattern_id_3b4b914b_fk_core_prog` (`pattern_id`),
  CONSTRAINT `core_collegeprogress_college_id_16ad9214_fk_core_coll` FOREIGN KEY (`college_id`) REFERENCES `core_college` (`cid`),
  CONSTRAINT `core_collegeprogress_pattern_id_3b4b914b_fk_core_prog` FOREIGN KEY (`pattern_id`) REFERENCES `core_progresspattern` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_collegeprogresspattern`
--

LOCK TABLES `core_collegeprogresspattern` WRITE;
/*!40000 ALTER TABLE `core_collegeprogresspattern` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_collegeprogresspattern` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_department`
--

DROP TABLE IF EXISTS `core_department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_department` (
  `department_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `college_id` int(11) NOT NULL,
  PRIMARY KEY (`department_id`),
  KEY `core_department_college_id_efc1eb5e_fk_core_college_cid` (`college_id`),
  CONSTRAINT `core_department_college_id_efc1eb5e_fk_core_college_cid` FOREIGN KEY (`college_id`) REFERENCES `core_college` (`cid`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_department`
--

LOCK TABLES `core_department` WRITE;
/*!40000 ALTER TABLE `core_department` DISABLE KEYS */;
INSERT INTO `core_department` VALUES (1,'┘┘è╪▓┘è╪د╪ة','',2),(2,'╪╖┘┘ê┘╪ر ┘à╪ذ┘â╪▒╪ر - ╪▒┘è╪د╪╢ ╪د╪╖┘╪د┘','',2),(3,'╪╣┘┘ê┘à ╪ص╪د╪│┘ê╪ذ','',3),(4,'┘╪╕┘à ┘à╪╣┘┘ê┘à╪د╪ز','',3),(5,'╪ز┘â┘┘ê┘┘ê╪ش┘è╪د ┘à╪╣┘┘ê┘à╪د╪ز','',3),(6,'╪╣┘┘ê┘à ╪ص╪د╪│┘ê╪ذ','',5),(7,'╪ز┘â┘┘ê┘┘ê╪ش┘è╪د ┘à╪╣┘┘ê┘à╪د╪ز','',5);
/*!40000 ALTER TABLE `core_department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_departmentprogresspattern`
--

DROP TABLE IF EXISTS `core_departmentprogresspattern`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_departmentprogresspattern` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `is_default` tinyint(1) NOT NULL,
  `assigned_at` datetime(6) NOT NULL,
  `department_id` int(11) NOT NULL,
  `pattern_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_departmentprogressp_department_id_pattern_id_6c92fbc4_uniq` (`department_id`,`pattern_id`),
  KEY `core_departmentprogr_pattern_id_e1159cd0_fk_core_prog` (`pattern_id`),
  CONSTRAINT `core_departmentprogr_department_id_7c0540de_fk_core_depa` FOREIGN KEY (`department_id`) REFERENCES `core_department` (`department_id`),
  CONSTRAINT `core_departmentprogr_pattern_id_e1159cd0_fk_core_prog` FOREIGN KEY (`pattern_id`) REFERENCES `core_progresspattern` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_departmentprogresspattern`
--

LOCK TABLES `core_departmentprogresspattern` WRITE;
/*!40000 ALTER TABLE `core_departmentprogresspattern` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_departmentprogresspattern` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_group`
--

DROP TABLE IF EXISTS `core_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_group` (
  `group_id` int(11) NOT NULL AUTO_INCREMENT,
  `group_name` varchar(255) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `academic_year` varchar(9) DEFAULT NULL,
  `pattern_id` bigint(20) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`group_id`),
  KEY `core_group_project_id_0d5f63ca` (`project_id`),
  KEY `core_group_pattern_id_b715922c_fk_core_progresspattern_id` (`pattern_id`),
  KEY `core_group_program_id_0eafc409_fk_core_program_pid` (`program_id`),
  KEY `core_group_department_id_8d3989e6_fk_core_depa` (`department_id`),
  CONSTRAINT `core_group_department_id_8d3989e6_fk_core_depa` FOREIGN KEY (`department_id`) REFERENCES `core_department` (`department_id`),
  CONSTRAINT `core_group_pattern_id_b715922c_fk_core_progresspattern_id` FOREIGN KEY (`pattern_id`) REFERENCES `core_progresspattern` (`id`),
  CONSTRAINT `core_group_program_id_0eafc409_fk_core_program_pid` FOREIGN KEY (`program_id`) REFERENCES `core_program` (`pid`),
  CONSTRAINT `core_group_project_id_0d5f63ca_fk_core_project_project_id` FOREIGN KEY (`project_id`) REFERENCES `core_project` (`project_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_group`
--

LOCK TABLES `core_group` WRITE;
/*!40000 ALTER TABLE `core_group` DISABLE KEYS */;
INSERT INTO `core_group` VALUES (1,'group_1',1,NULL,NULL,NULL,'2026-01-07 07:04:38.035567',NULL);
/*!40000 ALTER TABLE `core_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_groupcreationrequest`
--

DROP TABLE IF EXISTS `core_groupcreationrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_groupcreationrequest` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_name` varchar(255) NOT NULL,
  `department_id` int(11) NOT NULL,
  `college_id` int(11) NOT NULL,
  `note` longtext DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `is_fully_confirmed` tinyint(1) NOT NULL,
  `creator_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `core_groupcreationrequest_creator_id_97b1a4ff_fk_core_user_id` (`creator_id`),
  CONSTRAINT `core_groupcreationrequest_creator_id_97b1a4ff_fk_core_user_id` FOREIGN KEY (`creator_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_groupcreationrequest`
--

LOCK TABLES `core_groupcreationrequest` WRITE;
/*!40000 ALTER TABLE `core_groupcreationrequest` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_groupcreationrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_groupinvitation`
--

DROP TABLE IF EXISTS `core_groupinvitation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_groupinvitation` (
  `invitation_id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `responded_at` datetime(6) DEFAULT NULL,
  `group_id` int(11) NOT NULL,
  `invited_by_id` bigint(20) NOT NULL,
  `invited_student_id` bigint(20) NOT NULL,
  PRIMARY KEY (`invitation_id`),
  UNIQUE KEY `core_groupinvitation_group_id_invited_student_id_e7e882c8_uniq` (`group_id`,`invited_student_id`),
  KEY `core_groupinvitation_invited_by_id_ecbae904_fk_core_user_id` (`invited_by_id`),
  KEY `core_groupinvitation_invited_student_id_1606a3f6_fk_core_user_id` (`invited_student_id`),
  CONSTRAINT `core_groupinvitation_group_id_d794f45a_fk_core_group_group_id` FOREIGN KEY (`group_id`) REFERENCES `core_group` (`group_id`),
  CONSTRAINT `core_groupinvitation_invited_by_id_ecbae904_fk_core_user_id` FOREIGN KEY (`invited_by_id`) REFERENCES `core_user` (`id`),
  CONSTRAINT `core_groupinvitation_invited_student_id_1606a3f6_fk_core_user_id` FOREIGN KEY (`invited_student_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_groupinvitation`
--

LOCK TABLES `core_groupinvitation` WRITE;
/*!40000 ALTER TABLE `core_groupinvitation` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_groupinvitation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_groupmemberapproval`
--

DROP TABLE IF EXISTS `core_groupmemberapproval`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_groupmemberapproval` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `role` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `responded_at` datetime(6) DEFAULT NULL,
  `request_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_groupmemberapproval_request_id_user_id_cd483ed8_uniq` (`request_id`,`user_id`),
  KEY `core_groupmemberapproval_user_id_d3f6b9e9_fk_core_user_id` (`user_id`),
  CONSTRAINT `core_groupmemberappr_request_id_6838e530_fk_core_grou` FOREIGN KEY (`request_id`) REFERENCES `core_groupcreationrequest` (`id`),
  CONSTRAINT `core_groupmemberapproval_user_id_d3f6b9e9_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_groupmemberapproval`
--

LOCK TABLES `core_groupmemberapproval` WRITE;
/*!40000 ALTER TABLE `core_groupmemberapproval` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_groupmemberapproval` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_groupmembers`
--

DROP TABLE IF EXISTS `core_groupmembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_groupmembers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_groupmembers_user_id_group_id_9a933f80_uniq` (`user_id`,`group_id`),
  KEY `core_groupmembers_group_id_8d50b7fb_fk_core_group_group_id` (`group_id`),
  CONSTRAINT `core_groupmembers_group_id_8d50b7fb_fk_core_group_group_id` FOREIGN KEY (`group_id`) REFERENCES `core_group` (`group_id`),
  CONSTRAINT `core_groupmembers_user_id_849bee57_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_groupmembers`
--

LOCK TABLES `core_groupmembers` WRITE;
/*!40000 ALTER TABLE `core_groupmembers` DISABLE KEYS */;
INSERT INTO `core_groupmembers` VALUES (1,1,5),(2,1,6),(3,1,7);
/*!40000 ALTER TABLE `core_groupmembers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_groupsupervisors`
--

DROP TABLE IF EXISTS `core_groupsupervisors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_groupsupervisors` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `type` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_groupsupervisors_user_id_group_id_4a22a46f_uniq` (`user_id`,`group_id`),
  KEY `core_groupsupervisors_group_id_3a486c84_fk_core_group_group_id` (`group_id`),
  CONSTRAINT `core_groupsupervisors_group_id_3a486c84_fk_core_group_group_id` FOREIGN KEY (`group_id`) REFERENCES `core_group` (`group_id`),
  CONSTRAINT `core_groupsupervisors_user_id_ef155321_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_groupsupervisors`
--

LOCK TABLES `core_groupsupervisors` WRITE;
/*!40000 ALTER TABLE `core_groupsupervisors` DISABLE KEYS */;
INSERT INTO `core_groupsupervisors` VALUES (1,1,14,'supervisor');
/*!40000 ALTER TABLE `core_groupsupervisors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_notification`
--

DROP TABLE IF EXISTS `core_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_notification` (
  `not_ID` int(11) NOT NULL AUTO_INCREMENT,
  `message` longtext NOT NULL,
  `state` varchar(50) NOT NULL,
  `date` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`not_ID`),
  KEY `core_notification_user_id_6e341aac_fk_core_user_id` (`user_id`),
  CONSTRAINT `core_notification_user_id_6e341aac_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_notification`
--

LOCK TABLES `core_notification` WRITE;
/*!40000 ALTER TABLE `core_notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_notificationlog`
--

DROP TABLE IF EXISTS `core_notificationlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_notificationlog` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `message` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `is_sent_email` tinyint(1) NOT NULL,
  `notification_type` varchar(50) DEFAULT NULL,
  `read_at` datetime(6) DEFAULT NULL,
  `recipient_id` bigint(20) DEFAULT NULL,
  `related_approval_id` int(11) DEFAULT NULL,
  `related_group_id` int(11) DEFAULT NULL,
  `related_project_id` int(11) DEFAULT NULL,
  `related_user_id` bigint(20) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `core_notificationlog_related_approval_id_8e578898_fk_core_appr` (`related_approval_id`),
  KEY `core_notificationlog_related_group_id_6660a48a_fk_core_grou` (`related_group_id`),
  KEY `core_notificationlog_related_project_id_cff9baef_fk_core_proj` (`related_project_id`),
  KEY `core_notificationlog_related_user_id_7923bded_fk_core_user_id` (`related_user_id`),
  KEY `core_notifi_recipie_0a9596_idx` (`recipient_id`,`created_at`),
  KEY `core_notifi_is_read_4166bb_idx` (`is_read`,`recipient_id`),
  CONSTRAINT `core_notificationlog_recipient_id_708a156e_fk_core_user_id` FOREIGN KEY (`recipient_id`) REFERENCES `core_user` (`id`),
  CONSTRAINT `core_notificationlog_related_approval_id_8e578898_fk_core_appr` FOREIGN KEY (`related_approval_id`) REFERENCES `core_approvalrequest` (`approval_id`),
  CONSTRAINT `core_notificationlog_related_group_id_6660a48a_fk_core_grou` FOREIGN KEY (`related_group_id`) REFERENCES `core_group` (`group_id`),
  CONSTRAINT `core_notificationlog_related_project_id_cff9baef_fk_core_proj` FOREIGN KEY (`related_project_id`) REFERENCES `core_project` (`project_id`),
  CONSTRAINT `core_notificationlog_related_user_id_7923bded_fk_core_user_id` FOREIGN KEY (`related_user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_notificationlog`
--

LOCK TABLES `core_notificationlog` WRITE;
/*!40000 ALTER TABLE `core_notificationlog` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_notificationlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_patternstageassignment`
--

DROP TABLE IF EXISTS `core_patternstageassignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_patternstageassignment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order` int(10) unsigned NOT NULL CHECK (`order` >= 0),
  `max_mark` double DEFAULT NULL,
  `pattern_id` bigint(20) NOT NULL,
  `stage_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_patternstageassignment_pattern_id_stage_id_3a755db9_uniq` (`pattern_id`,`stage_id`),
  UNIQUE KEY `core_patternstageassignment_pattern_id_order_8a301bd5_uniq` (`pattern_id`,`order`),
  KEY `core_patternstageass_stage_id_97c0d469_fk_core_prog` (`stage_id`),
  CONSTRAINT `core_patternstageass_pattern_id_5dc5ae52_fk_core_prog` FOREIGN KEY (`pattern_id`) REFERENCES `core_progresspattern` (`id`),
  CONSTRAINT `core_patternstageass_stage_id_97c0d469_fk_core_prog` FOREIGN KEY (`stage_id`) REFERENCES `core_progressstage` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_patternstageassignment`
--

LOCK TABLES `core_patternstageassignment` WRITE;
/*!40000 ALTER TABLE `core_patternstageassignment` DISABLE KEYS */;
INSERT INTO `core_patternstageassignment` VALUES (1,1,20,1,1);
/*!40000 ALTER TABLE `core_patternstageassignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_patternsubstageassignment`
--

DROP TABLE IF EXISTS `core_patternsubstageassignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_patternsubstageassignment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order` int(10) unsigned NOT NULL CHECK (`order` >= 0),
  `max_mark` double DEFAULT NULL,
  `pattern_stage_assignment_id` bigint(20) NOT NULL,
  `sub_stage_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_patternsubstageassi_pattern_stage_assignment_8a3646e8_uniq` (`pattern_stage_assignment_id`,`sub_stage_id`),
  UNIQUE KEY `core_patternsubstageassi_pattern_stage_assignment_935d9564_uniq` (`pattern_stage_assignment_id`,`order`),
  KEY `core_patternsubstage_sub_stage_id_30b353c4_fk_core_prog` (`sub_stage_id`),
  CONSTRAINT `core_patternsubstage_pattern_stage_assign_6d8899c3_fk_core_patt` FOREIGN KEY (`pattern_stage_assignment_id`) REFERENCES `core_patternstageassignment` (`id`),
  CONSTRAINT `core_patternsubstage_sub_stage_id_30b353c4_fk_core_prog` FOREIGN KEY (`sub_stage_id`) REFERENCES `core_progresssubstage` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_patternsubstageassignment`
--

LOCK TABLES `core_patternsubstageassignment` WRITE;
/*!40000 ALTER TABLE `core_patternsubstageassignment` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_patternsubstageassignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_permission`
--

DROP TABLE IF EXISTS `core_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_permission` (
  `perm_ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `Description` longtext DEFAULT NULL,
  PRIMARY KEY (`perm_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_permission`
--

LOCK TABLES `core_permission` WRITE;
/*!40000 ALTER TABLE `core_permission` DISABLE KEYS */;
INSERT INTO `core_permission` VALUES (1,'search_in_projects',''),(2,'create_group',''),(4,'project_confirmation','from company goverment'),(5,'project_proposal',''),(6,'reject_joining_to_group',''),(7,'supervisor_selection',''),(8,'upload_final_project',''),(9,'update_project_topic',''),(10,'login',''),(11,'project_approval',''),(12,'project_assignment',''),(13,'co_superviosor_assignment',''),(14,'co_supervisor_approval',''),(15,'co_supervisor_selection',''),(16,'create_account',''),(17,'apply_project_modification',''),(18,'approval_for_group_participation_in_joint_project',''),(19,'apply_group_modification',''),(20,'accept_requiremenets',''),(21,'reject_requirements',''),(22,'manage_users',''),(23,'manage_projects','across universities'),(24,'supervisor_approval',''),(25,'supervisor_assignment',''),(26,'manage_users_cross_universities',''),(27,'manage_projects_accross_universities',''),(28,'propose_project',''),(29,'follow_project_status',''),(30,'project_topic_approval',''),(31,'approval_of_changing_student_group',''),(32,'manage_users_accounts',''),(33,'confirm_final_documantion',''),(34,'apply_project_modification_across_university',''),(35,'approval_for_group_participation_in_joint_project_across_universities',''),(36,'apply_group_modification_across_universities',''),(37,'co_superviosor_assignment_across_universities',''),(38,'co_superviosor_assignment_across_universities',''),(39,'approve_co_supervisor_across_universities',''),(40,'supervisor_assignment_accross_universities',''),(41,'approve_supervisor_across_universities','');
/*!40000 ALTER TABLE `core_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_program`
--

DROP TABLE IF EXISTS `core_program`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_program` (
  `pid` int(11) NOT NULL AUTO_INCREMENT,
  `p_name` varchar(255) NOT NULL,
  `department_id` int(11) NOT NULL,
  PRIMARY KEY (`pid`),
  KEY `core_program_department_id_7121ebdd_fk_core_depa` (`department_id`),
  CONSTRAINT `core_program_department_id_7121ebdd_fk_core_depa` FOREIGN KEY (`department_id`) REFERENCES `core_department` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_program`
--

LOCK TABLES `core_program` WRITE;
/*!40000 ALTER TABLE `core_program` DISABLE KEYS */;
INSERT INTO `core_program` VALUES (1,'┘┘è╪▓┘è╪د╪ة',1),(2,'╪╖┘┘ê┘╪ر ┘à╪ذ┘â╪▒╪ر - ╪▒┘è╪د╪╢ ╪د╪╖┘╪د┘',2),(3,'╪╣┘┘ê┘à ╪د┘╪ص╪د╪│┘ê╪ذ ┘ê╪ز┘é┘┘è╪ر',3);
/*!40000 ALTER TABLE `core_program` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_progresspattern`
--

DROP TABLE IF EXISTS `core_progresspattern`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_progresspattern` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_progresspattern`
--

LOCK TABLES `core_progresspattern` WRITE;
/*!40000 ALTER TABLE `core_progresspattern` DISABLE KEYS */;
INSERT INTO `core_progresspattern` VALUES (1,'pattren_1');
/*!40000 ALTER TABLE `core_progresspattern` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_progressstage`
--

DROP TABLE IF EXISTS `core_progressstage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_progressstage` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `description` longtext DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_progressstage`
--

LOCK TABLES `core_progressstage` WRITE;
/*!40000 ALTER TABLE `core_progressstage` DISABLE KEYS */;
INSERT INTO `core_progressstage` VALUES (1,'','project _start');
/*!40000 ALTER TABLE `core_progressstage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_progresssubstage`
--

DROP TABLE IF EXISTS `core_progresssubstage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_progresssubstage` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `order` int(10) unsigned NOT NULL CHECK (`order` >= 0),
  `max_mark` double DEFAULT NULL,
  `stage_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_progresssubstage_stage_id_name_43aa852c_uniq` (`stage_id`,`name`),
  CONSTRAINT `core_progresssubstage_stage_id_98f4ee51_fk_core_progressstage_id` FOREIGN KEY (`stage_id`) REFERENCES `core_progressstage` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_progresssubstage`
--

LOCK TABLES `core_progresssubstage` WRITE;
/*!40000 ALTER TABLE `core_progresssubstage` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_progresssubstage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_project`
--

DROP TABLE IF EXISTS `core_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_project` (
  `project_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `type` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `state` varchar(100) NOT NULL,
  `description` longtext NOT NULL,
  `college_id` int(11) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`project_id`),
  KEY `core_project_college_id_e12ccd65_fk_core_college_cid` (`college_id`),
  KEY `core_project_created_by_id_3ae31859_fk_core_user_id` (`created_by_id`),
  CONSTRAINT `core_project_college_id_e12ccd65_fk_core_college_cid` FOREIGN KEY (`college_id`) REFERENCES `core_college` (`cid`),
  CONSTRAINT `core_project_created_by_id_3ae31859_fk_core_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_project`
--

LOCK TABLES `core_project` WRITE;
/*!40000 ALTER TABLE `core_project` DISABLE KEYS */;
INSERT INTO `core_project` VALUES (1,'pro_1','PrivateCompany','2025-12-11',NULL,'Completed','┘à┘ç┘à',3,NULL);
/*!40000 ALTER TABLE `core_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_role`
--

DROP TABLE IF EXISTS `core_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_role` (
  `role_ID` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(100) NOT NULL,
  `role_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`role_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_role`
--

LOCK TABLES `core_role` WRITE;
/*!40000 ALTER TABLE `core_role` DISABLE KEYS */;
INSERT INTO `core_role` VALUES (1,'Ministry','General_Managment_System'),(2,'External_Company',NULL),(3,'Dean',NULL),(4,'CO-Supervisor',NULL),(5,'Student',NULL),(6,'University President',NULL),(7,'System Manager',NULL),(8,'Department Head',NULL),(9,'Supervisor',NULL);
/*!40000 ALTER TABLE `core_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_rolepermission`
--

DROP TABLE IF EXISTS `core_rolepermission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_rolepermission` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `permission_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_rolepermission_role_ID_perm_ID_4910cd40_uniq` (`role_id`,`permission_id`),
  KEY `core_rolepermission_permission_id_c07e293f_fk_core_perm` (`permission_id`),
  CONSTRAINT `core_rolepermission_permission_id_c07e293f_fk_core_perm` FOREIGN KEY (`permission_id`) REFERENCES `core_permission` (`perm_ID`),
  CONSTRAINT `core_rolepermission_role_id_473ce1e1_fk_core_role_role_ID` FOREIGN KEY (`role_id`) REFERENCES `core_role` (`role_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_rolepermission`
--

LOCK TABLES `core_rolepermission` WRITE;
/*!40000 ALTER TABLE `core_rolepermission` DISABLE KEYS */;
INSERT INTO `core_rolepermission` VALUES (11,2,1),(4,13,1),(3,14,1),(5,16,1),(6,17,1),(7,18,1),(8,19,1),(9,20,1),(10,21,1),(1,24,1),(2,25,1),(12,26,1),(13,27,1),(15,16,2),(14,28,2),(16,29,2),(17,2,3),(23,13,3),(22,14,3),(18,16,3),(21,17,3),(19,20,3),(20,21,3),(24,24,3),(25,25,3),(26,14,4),(27,16,4),(28,1,5),(29,2,5),(30,4,5),(31,5,5),(33,7,5),(35,8,5),(32,9,5),(34,15,5),(44,2,6),(43,16,6),(45,20,6),(46,21,6),(38,34,6),(36,35,6),(37,36,6),(39,37,6),(40,39,6),(41,40,6),(42,41,6),(47,16,7),(48,32,7),(49,33,7),(51,2,8),(52,13,8),(53,14,8),(50,16,8),(56,18,8),(57,19,8),(60,20,8),(59,21,8),(55,24,8),(54,25,8),(58,30,8),(61,31,8),(64,2,9),(65,16,9),(66,18,9),(62,30,9),(63,31,9);
/*!40000 ALTER TABLE `core_rolepermission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_studentprogress`
--

DROP TABLE IF EXISTS `core_studentprogress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_studentprogress` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `score` double DEFAULT NULL,
  `notes` longtext DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `group_id` int(11) NOT NULL,
  `pattern_stage_assignment_id` bigint(20) NOT NULL,
  `student_id` bigint(20) NOT NULL,
  `sub_stage_assignment_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_studentprogress_student_id_group_id_patt_c8bbcf69_uniq` (`student_id`,`group_id`,`pattern_stage_assignment_id`,`sub_stage_assignment_id`),
  KEY `core_studentprogress_group_id_b278db14_fk_core_group_group_id` (`group_id`),
  KEY `core_studentprogress_pattern_stage_assign_52221ec8_fk_core_patt` (`pattern_stage_assignment_id`),
  KEY `core_studentprogress_sub_stage_assignment_646204a0_fk_core_patt` (`sub_stage_assignment_id`),
  CONSTRAINT `core_studentprogress_group_id_b278db14_fk_core_group_group_id` FOREIGN KEY (`group_id`) REFERENCES `core_group` (`group_id`),
  CONSTRAINT `core_studentprogress_pattern_stage_assign_52221ec8_fk_core_patt` FOREIGN KEY (`pattern_stage_assignment_id`) REFERENCES `core_patternstageassignment` (`id`),
  CONSTRAINT `core_studentprogress_student_id_5fe391e4_fk_core_user_id` FOREIGN KEY (`student_id`) REFERENCES `core_user` (`id`),
  CONSTRAINT `core_studentprogress_sub_stage_assignment_646204a0_fk_core_patt` FOREIGN KEY (`sub_stage_assignment_id`) REFERENCES `core_patternsubstageassignment` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_studentprogress`
--

LOCK TABLES `core_studentprogress` WRITE;
/*!40000 ALTER TABLE `core_studentprogress` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_studentprogress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_systemsettings`
--

DROP TABLE IF EXISTS `core_systemsettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_systemsettings` (
  `setting_value` longtext NOT NULL,
  `description` longtext DEFAULT NULL,
  `setting_key` varchar(255) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_systemsettings`
--

LOCK TABLES `core_systemsettings` WRITE;
/*!40000 ALTER TABLE `core_systemsettings` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_systemsettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_university`
--

DROP TABLE IF EXISTS `core_university`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_university` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `uname_ar` varchar(255) NOT NULL,
  `uname_en` varchar(255) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_university`
--

LOCK TABLES `core_university` WRITE;
/*!40000 ALTER TABLE `core_university` DISABLE KEYS */;
INSERT INTO `core_university` VALUES (1,'╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',NULL,'╪ص┘â┘ê┘à┘è'),(2,'╪ش╪د┘à╪╣╪ر ╪د┘╪ص╪»┘è╪»╪ر',NULL,'╪ص┘â┘ê┘à┘è'),(3,'╪ش╪د┘à╪╣╪ر ╪ز╪╣╪▓',NULL,'╪ص┘â┘ê┘à┘è'),(4,'╪ش╪د┘à╪╣╪ر ╪ح╪ذ',NULL,'╪ص┘â┘ê┘à┘è'),(5,'╪ش╪د┘à╪╣╪ر ╪░┘à╪د╪▒',NULL,'╪ص┘â┘ê┘à┘è'),(6,'╪ش╪د┘à╪╣╪ر ╪╣╪»┘',NULL,'╪ص┘â┘ê┘à┘è'),(7,'╪ش╪د┘à╪╣╪ر ╪ص╪╢╪▒┘à┘ê╪ز',NULL,'╪ص┘â┘ê┘à┘è'),(9,'╪ش╪د┘à╪╣╪ر ╪ص╪ش╪ر',NULL,'╪ص┘â┘ê┘à┘è'),(10,'╪ش╪د┘à╪╣╪ر ╪د┘╪ذ┘è╪╢╪د╪ة',NULL,'╪ص┘â┘ê┘à┘è'),(11,'╪ش╪د┘à╪╣╪ر ╪╣┘à╪▒╪د┘',NULL,'╪ص┘â┘ê┘à┘è'),(12,'╪ش╪د┘à╪╣╪ر ╪╡╪╣╪»╪ر',NULL,'╪ص┘â┘ê┘à┘è'),(13,'╪ش╪د┘à╪╣╪ر ╪د┘╪╢╪د┘╪╣',NULL,'╪ص┘â┘ê┘à┘è'),(14,'╪ش╪د┘à╪╣╪ر ╪د┘┘à╪ص┘ê┘è╪ز',NULL,'╪ص┘â┘ê┘à┘è'),(15,'╪د┘╪ش╪د┘à╪╣╪ر ╪د┘┘è┘à┘┘è╪ر',NULL,'╪د┘ç┘┘è'),(16,'╪ش╪د┘à╪╣╪ر ╪د┘╪╣┘┘ê┘à ┘ê╪د┘╪ز┘â┘┘ê┘┘ê╪ش┘è╪د',NULL,'╪د┘ç┘┘è'),(17,'╪ش╪د┘à╪╣╪ر ╪د┘┘à╪│╪ز┘é╪ذ┘',NULL,'╪د┘ç┘┘è'),(18,'╪ش╪د┘à╪╣╪ر ╪د┘╪▒╪د╪▓┘è',NULL,'╪د┘ç┘┘è'),(19,'╪ش╪د┘à╪╣╪ر ╪د┘╪ص┘â┘à╪ر','','╪د┘ç┘┘è');
/*!40000 ALTER TABLE `core_university` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_user`
--

DROP TABLE IF EXISTS `core_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_user`
--

LOCK TABLES `core_user` WRITE;
/*!40000 ALTER TABLE `core_user` DISABLE KEYS */;
INSERT INTO `core_user` VALUES (2,'pbkdf2_sha256$1000000$C8DxF5TmE1r4Wf1f8Q3Os5$E6AFiywuAYeKXDDdo/pgn1tKMc934f3vFUoVxlRK2+k=','2026-01-03 14:02:09.660184',1,'╪┤╪░╪د','╪┤╪░╪د','╪»┘ç┘à╪┤','shathadahmash@gmail.com',1,1,'2025-12-08 14:31:53.000000','777777777',NULL,'╪┤╪░╪د ╪»┘ç┘à╪┤','Female'),(3,'pbkdf2_sha256$1000000$9w8yIF4wsvuRBchWfolRKU$OYBBKHR7dffsROjoL9Z2PpN3W8v+FkIvREWdv/ykX4E=','2025-12-31 07:31:12.745980',0,'╪د╪ص┘à╪»','╪د╪ص┘à╪»','╪د╪ص┘à╪»','ahmed@gmail.com',0,1,'2025-12-09 05:53:54.000000','775775775',NULL,'╪د╪ص┘à╪» ╪د╪ص┘à╪»','Male'),(4,'pbkdf2_sha256$1000000$p0f8PPhFMRjYwOkVwqm7VQ$dpkxlpzjg6iImvBF93G0Hkt30dLhKJNxRy/rGPEzZlU=','2026-01-11 23:55:17.507088',0,'╪د┘┘╪د┘','╪د┘┘╪د┘','╪░┘è╪د╪ذ','',0,1,'2025-12-09 11:20:57.000000','776776776',NULL,'╪د┘┘╪د┘ ╪░┘è╪د╪ذ','Female'),(5,'pbkdf2_sha256$1000000$qQIVoOG8hw7jmVdEmtE1K6$+EzRJ6ityQm3sQk9KyBB546Z7owoHp8KHZL5kSz3LYo=',NULL,0,'╪د╪ذ╪ز┘ç╪د┘','╪د╪ذ╪ز┘ç╪د┘','┘à╪▒╪د╪»','',0,1,'2025-12-09 11:22:22.000000',NULL,NULL,'╪د╪ذ╪ز┘ç╪د┘ ┘à╪▒╪د╪»','Female'),(6,'pbkdf2_sha256$1000000$PThovkwrU6QDKfGpDbxxXE$vv8uUs2KmAXdmPl2/djUt5mYQEJLyH6ooHObxgNNpNs=',NULL,0,'┘╪د╪╖┘à╪ر','┘╪د╪╖┘à╪ر','╪د┘┘╪د╪ش┘è','',0,1,'2025-12-09 11:23:06.000000',NULL,NULL,'┘╪د╪╖┘à╪ر ╪د┘┘╪د╪ش┘è','Female'),(7,'pbkdf2_sha256$1000000$CQCL4vuV6YVW53Xs4CInYk$G/LHEB7601QdVgpxIL5VMv/78Pw3dQd8MKQoR1Aqy7w=',NULL,0,'╪▒╪▓╪د┘','╪▒╪▓╪د┘','╪»┘ç┘à╪┤','',0,1,'2025-12-09 11:26:29.000000',NULL,NULL,'╪▒╪▓╪د┘ ╪»┘ç┘à╪┤','Female'),(11,'pbkdf2_sha256$1000000$jj0xurMW63AEEmNjKDufTY$pDUGsjq/pnj9S3cCiMZZ69YtWX3nzDOiDJCdkSwUTh8=','2026-01-08 10:08:38.508968',0,'╪┤┘╪ذ┘è','╪د╪ص┘à╪»','╪┤┘╪ذ┘è','',0,1,'2025-12-09 11:29:37.000000',NULL,NULL,'╪د╪ص┘à╪» ╪┤┘╪ذ┘è','Male'),(12,'pbkdf2_sha256$1000000$c6NzXd93RsN521VDu3h5Cm$tT3Lnpw3Szg07ebmGcZsVVGBHlyCVA6vlIhtodJxaLk=',NULL,0,'╪د┘┘ê┘┘è╪»','╪د┘┘ê┘┘è╪»','╪د┘╪»╪╣┘è╪│','',0,1,'2025-12-09 11:29:58.000000',NULL,NULL,'╪د┘┘ê┘┘è╪» ╪د┘╪»╪╣┘è╪│','Male'),(13,'pbkdf2_sha256$1000000$ZBtMu6lyntqaLAVaSsTK0H$ga2uXag+FNSDBRZo0/K7cjbpfgAY6RH9dfUTrvyEXsM=',NULL,0,'┘à┘ê╪│┘ë','┘à┘ê╪│┘ë','╪د┘╪║╪▒╪د╪ذ','',0,1,'2025-12-09 11:31:24.000000',NULL,NULL,'┘à┘ê╪│┘ë ╪د┘╪║╪▒╪د╪ذ','Male'),(14,'pbkdf2_sha256$1000000$03wbPdOPvDwBkTey1YPtfT$PesiYPNKEuI2yKuwIOWeKuzlrW8t8GVnmCoqVcVyz24=','2025-12-10 21:38:40.000000',0,'╪ح╪ذ╪▒╪د┘ç┘è┘à','╪ح╪ذ╪▒╪د┘ç┘è┘à','╪د┘╪ص╪»╪د╪»','',0,1,'2025-12-09 11:32:10.000000',NULL,NULL,'╪ح╪ذ╪▒╪د┘ç┘è┘à ╪د┘╪ص╪»╪د╪»','Male'),(15,'pbkdf2_sha256$1000000$Q2FzT6qXnTsgiYdoTlb9eV$czkEIj4jK3K5pzIu+roNeJlSY3YH0+So1tfF8rZj8Ls=',NULL,0,'┘à╪▒┘ê╪ر','┘à╪▒┘ê╪ر','╪د┘┘ç╪د╪»┘è','',0,1,'2025-12-09 11:32:31.000000',NULL,NULL,'┘à╪▒┘ê╪ر ╪د┘┘ç╪د╪»┘è','Female'),(16,'pbkdf2_sha256$1000000$yDLfkHG2156HN4VRjD7hZJ$yxKLYhL0Q3rwKhBflUFcaJg/1AKbziBDP/BHvzRb9W4=','2026-01-02 14:25:34.587110',0,'┘ê╪▓╪د╪▒╪ر1','┘ê╪▓╪د╪▒╪ر_1','','',0,1,'2025-12-09 11:32:57.000000',NULL,NULL,'┘ê╪▓╪د╪▒╪ر_1',NULL),(17,'pbkdf2_sha256$1000000$rNgJ3z8trQ6oyYgT5P72Up$3weP6h5Hr+SdSAq7Y23GmUQWUPtaBPSBQ4f/4qkgfjI=',NULL,0,'┘ê╪▓╪د╪▒╪ر2','┘ê╪▓╪د╪▒╪ر_2','','',0,1,'2025-12-09 11:33:18.000000',NULL,NULL,'┘ê╪▓╪د╪▒╪ر_2',NULL),(18,'pbkdf2_sha256$1000000$BwHSO9jYzXBMAfkFUuayfJ$k7yFnKXGEMFsXQ1y8EMU8np4KPmCljGJ/24q9ePG8g0=',NULL,0,'╪┤╪▒┘â╪ر1','╪┤╪▒┘â╪ر ╪«╪د╪▒╪ش┘è╪ر_1','','',0,1,'2025-12-09 11:33:38.000000','777666888',NULL,'╪┤╪▒┘â╪ر ╪«╪د╪▒╪ش┘è╪ر_1',NULL),(20,'pbkdf2_sha256$1000000$ZcfiosidHcJw4OxPZIGdMA$tGWhQdPjqT7jvG3iN2RsOHQtbv0SRdAwOLbZm6eTipM=',NULL,0,'╪╣┘╪د┘ê','╪د╪ص┘à╪»','╪╣┘╪د┘ê','',0,1,'2025-12-09 11:34:19.000000',NULL,NULL,'╪د╪ص┘à╪» ╪╣┘╪د┘ê','Male'),(21,'pbkdf2_sha256$1000000$CEGSZHb7Y25bO6cxTG3fyq$6dPmMre+9KJEkE/c6VDAoCxBctzMWSnhTFR2Su5foFY=','2025-12-22 12:36:20.620984',0,'╪ش╪د┘à╪╣┘ç1','╪ح╪»╪د╪▒╪ر ╪ش╪د┘à╪╣╪ر _1','','',0,1,'2025-12-09 11:35:33.000000',NULL,NULL,'╪ح╪»╪د╪▒╪ر ╪ش╪د┘à╪╣╪ر _1',NULL),(22,'pbkdf2_sha256$1000000$bznDJ77CMIKMrr7GrLQGJD$wK8g2cj3PmFwy54ICfbYWgRUQn2y6D1ghlqcJtPdjxc=',NULL,0,'╪ش╪د┘à╪╣┘ç2','','','',0,1,'2025-12-09 11:35:52.562158',NULL,NULL,'',NULL),(23,'pbkdf2_sha256$1000000$A7ZPlQgSIXodxyWwxGD24y$4r82z6UUdxMCDMN7ey973gB9uHBqKEnG0/6clUogDSE=',NULL,0,'┘╪ج╪د╪»','┘╪ج╪د╪»','┘à╪▒╪┤╪»','',0,1,'2025-12-09 11:36:36.000000',NULL,NULL,'┘╪ج╪د╪» ┘à╪▒╪┤╪»','Male'),(25,'pbkdf2_sha256$1000000$T9u7EXtX5bwx5suHmHm5Xq$7sksT7BIIqrqUyH46VlmTfc194HozbHY2WzVNejRygY=','2026-01-13 05:51:58.229065',0,'┘à╪»┘è╪▒_1','╪┤╪░╪د','╪»┘ç┘à╪┤','',0,1,'2025-12-09 13:25:09.000000',NULL,NULL,'╪┤╪░╪د ╪»┘ç┘à╪┤','Female'),(39,'pbkdf2_sha256$1000000$k8kkxobbmaq6R3QQjjHyIW$SKtNYE4j8JXqgWGy+Qv7xEA8XEMiNhFXz8uWbdCHATM=','2026-01-04 06:05:33.228838',1,'shatha','','','shatha@gmail.com',1,1,'2026-01-04 06:05:23.726664',NULL,NULL,'',NULL),(40,'pbkdf2_sha256$1000000$H1DzibcL9YFHK9o8wiliVz$f+sblKpj2M3Nee3keabd541ojSDw/2rzhtQo79s7/ok=','2026-01-05 07:24:25.322948',0,'company','company','','',0,1,'2026-01-04 06:10:46.000000',NULL,NULL,'company','Other'),(41,'pbkdf2_sha256$1000000$ft1vWZjNjYSrxKbfT56q1p$LC9Q6ERHC118xOdSnFQMLoKAj41a8+oidlGM0MkCoMA=',NULL,0,'ss','','','ss@gmail.com',0,1,'2026-01-04 13:30:25.277878','88',NULL,'ss',NULL),(42,'pbkdf2_sha256$1000000$I15XMMPzjfqVtG3MUmwgvV$MoGYI5nzCK75HW42IoMvL6mXtS7j/Lv024c0xlC75Cc=',NULL,0,'sss','','','┘à╪»┘è╪▒_1',0,1,'2026-01-04 13:40:44.782383',NULL,NULL,'ss',NULL),(43,'pbkdf2_sha256$1000000$NAfDBfSwiqkyQIYcd1smy7$JWQIk+5u/OT2ehFYfrGMzwYLV4d1foprD/21sDvvPl0=',NULL,0,'','','','┘à╪»┘è╪▒_1',0,1,'2026-01-04 15:17:19.808092',NULL,NULL,'',NULL),(51,'pbkdf2_sha256$1000000$hLlXNNnjfcEGCv0p2PNP5A$J+QiEmznRujSOydbitgnTLDDP49oL+X1y8fi89LX5TM=',NULL,0,'fatima','','','fatma',0,1,'2026-01-05 09:04:34.693517',NULL,NULL,'alnagi',NULL);
/*!40000 ALTER TABLE `core_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_user_groups`
--

DROP TABLE IF EXISTS `core_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_user_groups` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_user_groups_user_id_group_id_c82fcad1_uniq` (`user_id`,`group_id`),
  KEY `core_user_groups_group_id_fe8c697f_fk_auth_group_id` (`group_id`),
  CONSTRAINT `core_user_groups_group_id_fe8c697f_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `core_user_groups_user_id_70b4d9b8_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_user_groups`
--

LOCK TABLES `core_user_groups` WRITE;
/*!40000 ALTER TABLE `core_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `core_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_user_user_permissions`
--

DROP TABLE IF EXISTS `core_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_user_user_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_user_user_permissions_user_id_permission_id_73ea0daa_uniq` (`user_id`,`permission_id`),
  KEY `core_user_user_permi_permission_id_35ccf601_fk_auth_perm` (`permission_id`),
  CONSTRAINT `core_user_user_permi_permission_id_35ccf601_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `core_user_user_permissions_user_id_085123d3_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=141 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_user_user_permissions`
--

LOCK TABLES `core_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `core_user_user_permissions` DISABLE KEYS */;
INSERT INTO `core_user_user_permissions` VALUES (1,11,1),(2,11,2),(3,11,3),(4,11,4),(5,11,5),(6,11,6),(7,11,7),(8,11,8),(9,11,9),(10,11,10),(11,11,11),(12,11,12),(13,11,13),(14,11,14),(15,11,15),(16,11,16),(17,11,17),(18,11,18),(19,11,19),(20,11,20),(21,11,21),(22,11,22),(23,11,23),(24,11,24),(25,11,25),(26,11,26),(27,11,27),(28,11,28),(29,11,29),(30,11,30),(31,11,31),(32,11,32),(33,11,33),(34,11,34),(35,11,35),(36,11,36),(37,11,37),(38,11,38),(39,11,39),(40,11,40),(41,11,41),(42,11,42),(43,11,43),(44,11,44),(45,11,45),(46,11,46),(47,11,47),(48,11,48),(49,11,49),(50,11,50),(51,11,51),(52,11,52),(53,11,53),(54,11,54),(55,11,55),(56,11,56),(57,11,57),(58,11,58),(59,11,59),(60,11,60),(61,11,61),(62,11,62),(63,11,63),(64,11,64),(65,11,65),(66,11,66),(67,11,67),(68,11,68),(69,11,69),(70,11,70),(71,11,71),(72,11,72),(73,11,73),(74,11,74),(75,11,75),(76,11,76),(77,11,77),(78,11,78),(79,11,79),(80,11,80),(81,11,81),(82,11,82),(83,11,83),(84,11,84),(85,11,85),(86,11,86),(87,11,87),(88,11,88),(89,11,89),(90,11,90),(91,11,91),(92,11,92),(93,11,93),(94,11,94),(95,11,95),(96,11,96),(97,11,97),(98,11,98),(99,11,99),(100,11,100),(101,11,101),(102,11,102),(103,11,103),(104,11,104),(105,11,105),(106,11,106),(107,11,107),(108,11,108),(109,11,109),(110,11,110),(111,11,111),(112,11,112),(113,11,113),(114,11,114),(115,11,115),(116,11,116),(117,11,117),(118,11,118),(119,11,119),(120,11,120),(121,11,121),(122,11,122),(123,11,123),(124,11,124),(125,11,125),(126,11,126),(127,11,127),(128,11,128),(129,11,129),(130,11,130),(131,11,131),(132,11,132),(133,11,133),(134,11,134),(135,11,135),(136,11,136),(137,11,137),(138,11,138),(139,11,139),(140,11,140);
/*!40000 ALTER TABLE `core_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `core_userroles`
--

DROP TABLE IF EXISTS `core_userroles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `core_userroles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `core_userroles_user_id_role_ID_c9e51f16_uniq` (`user_id`,`role_id`),
  KEY `core_userroles_role_id_6fae830d_fk_core_role_role_ID` (`role_id`),
  CONSTRAINT `core_userroles_role_id_6fae830d_fk_core_role_role_ID` FOREIGN KEY (`role_id`) REFERENCES `core_role` (`role_ID`),
  CONSTRAINT `core_userroles_user_id_d7bbca76_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `core_userroles`
--

LOCK TABLES `core_userroles` WRITE;
/*!40000 ALTER TABLE `core_userroles` DISABLE KEYS */;
INSERT INTO `core_userroles` VALUES (5,5,2),(6,9,3),(7,5,4),(8,5,5),(9,5,6),(10,5,7),(13,3,11),(14,4,12),(15,9,13),(27,8,14),(16,9,14),(17,9,15),(18,1,16),(19,1,17),(20,2,18),(22,4,20),(23,6,21),(24,6,22),(25,8,23),(36,9,23),(28,7,25),(34,2,40),(40,5,51);
/*!40000 ALTER TABLE `core_userroles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_core_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=229 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES (133,'2025-12-08 14:32:23.096330','2','shatha',2,'[{\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (5)\"}}]',6,2),(134,'2025-12-09 05:53:56.578609','3','ahmed',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (6)\"}}]',6,2),(135,'2025-12-09 07:24:25.648283','1','shatha affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(136,'2025-12-09 07:27:41.384855','3','╪د╪ص┘à╪» ╪د╪ص┘à╪»',2,'[{\"changed\": {\"fields\": [\"Username\", \"First name\", \"Last name\", \"Email address\", \"Phone\", \"Gender\"]}}]',6,2),(137,'2025-12-09 07:28:59.598543','3','╪د╪ص┘à╪» ╪د╪ص┘à╪»',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',6,2),(138,'2025-12-09 07:30:35.353338','2','shatha',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',6,2),(139,'2025-12-09 07:31:13.143190','2','╪┤╪░╪د',2,'[{\"changed\": {\"fields\": [\"Username\"]}}]',6,2),(140,'2025-12-09 07:31:49.575684','2','╪┤╪░╪د ╪»┘ç┘à╪┤',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Email address\", \"Phone\", \"Gender\"]}}]',6,2),(141,'2025-12-09 07:33:46.302592','3','╪د╪ص┘à╪» ╪د╪ص┘à╪»',2,'[]',6,2),(142,'2025-12-09 07:34:54.456428','2','╪د╪ص┘à╪» affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(143,'2025-12-09 11:21:00.731943','4','╪د┘┘╪د┘',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (7)\"}}]',6,2),(144,'2025-12-09 11:22:25.170161','5','╪د╪ذ╪ز┘ç╪د┘',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (8)\"}}]',6,2),(145,'2025-12-09 11:23:08.392868','6','┘╪د╪╖┘à╪ر',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (9)\"}}]',6,2),(146,'2025-12-09 11:26:30.438834','7','╪▒╪▓╪د┘',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (10)\"}}]',6,2),(147,'2025-12-09 11:26:54.116566','8','┘à┘┘è╪▒╪ر',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (11)\"}}]',6,2),(148,'2025-12-09 11:29:20.088394','10','┘à╪ص┘à╪»',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (12)\"}}]',6,2),(149,'2025-12-09 11:29:38.380691','11','╪┤┘╪ذ┘è',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (13)\"}}]',6,2),(150,'2025-12-09 11:29:59.013485','12','╪د┘┘ê┘┘è╪»',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (14)\"}}]',6,2),(151,'2025-12-09 11:31:25.691152','13','┘à┘ê╪│┘ë',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (15)\"}}]',6,2),(152,'2025-12-09 11:32:11.659855','14','╪ح╪ذ╪▒╪د┘ç┘è┘à',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (16)\"}}]',6,2),(153,'2025-12-09 11:32:31.900186','15','┘à╪▒┘ê╪ر',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (17)\"}}]',6,2),(154,'2025-12-09 11:32:58.553328','16','┘ê╪▓╪د╪▒╪ر1',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (18)\"}}]',6,2),(155,'2025-12-09 11:33:19.166123','17','┘ê╪▓╪د╪▒╪ر2',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (19)\"}}]',6,2),(156,'2025-12-09 11:33:39.361393','18','╪┤╪▒┘â╪ر1',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (20)\"}}]',6,2),(157,'2025-12-09 11:33:56.751413','19','╪┤╪▒┘â╪ر2',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (21)\"}}]',6,2),(158,'2025-12-09 11:34:19.967967','20','╪╣┘╪د┘ê',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (22)\"}}]',6,2),(159,'2025-12-09 11:35:34.785870','21','╪ش╪د┘à╪╣┘ç1',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (23)\"}}]',6,2),(160,'2025-12-09 11:35:53.390446','22','╪ش╪د┘à╪╣┘ç2',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (24)\"}}]',6,2),(161,'2025-12-09 11:36:37.176748','23','┘╪ج╪د╪»',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (25)\"}}]',6,2),(162,'2025-12-09 11:37:54.440251','24','╪د┘╪ذ┘╪╖╪ر',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (26)\"}}]',6,2),(163,'2025-12-09 11:40:05.282852','4','┘╪╕┘à ┘à╪╣┘┘ê┘à╪د╪ز - ┘â┘┘è╪ر ╪د┘╪ص╪د╪│┘ê╪ذ',1,'[{\"added\": {}}]',7,2),(164,'2025-12-09 11:40:23.705644','5','╪ز┘â┘┘ê┘┘ê╪ش┘è╪د ┘à╪╣┘┘ê┘à╪د╪ز - ┘â┘┘è╪ر ╪د┘╪ص╪د╪│┘ê╪ذ',1,'[{\"added\": {}}]',7,2),(165,'2025-12-09 11:41:27.801950','4','┘â┘┘è╪ر ╪د┘┘ç┘╪»╪│╪ر - ╪ش╪د┘à╪╣╪ر ╪د┘╪ص╪»┘è╪»╪ر - ╪د┘╪ص╪»┘è╪»╪ر Branch',1,'[{\"added\": {}}]',1,2),(166,'2025-12-09 11:42:24.169896','5','┘â┘┘è╪ر ╪د┘╪ص╪د╪│┘ê╪ذ - ╪ش╪د┘à╪╣╪ر ╪ز╪╣╪▓ - ╪ز╪╣╪▓ Branch',1,'[{\"added\": {}}]',1,2),(167,'2025-12-09 11:44:04.007417','6','┘â┘┘è╪ر ╪د┘┘ç┘╪»╪│╪ر - ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة - ╪ث┘à╪د┘╪ر ╪د┘╪╣╪د╪╡┘à╪ر Branch',1,'[{\"added\": {}}]',1,2),(168,'2025-12-09 11:46:24.334250','3','╪ح╪ذ╪▒╪د┘ç┘è┘à affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(169,'2025-12-09 11:46:40.692370','4','╪د╪ذ╪ز┘ç╪د┘ affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(170,'2025-12-09 11:48:08.861861','5','╪د┘┘╪د┘ affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(171,'2025-12-09 11:48:27.544772','6','╪د┘╪ذ┘╪╖╪ر affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(172,'2025-12-09 11:48:52.958478','7','╪د┘┘ê┘┘è╪» affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(173,'2025-12-09 11:50:51.969178','8','╪ش╪د┘à╪╣┘ç1 affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(174,'2025-12-09 11:51:25.028530','9','╪ش╪د┘à╪╣┘ç2 affiliated with ╪ش╪د┘à╪╣╪ر ╪ز╪╣╪▓',1,'[{\"added\": {}}]',13,2),(175,'2025-12-09 11:52:00.278060','10','╪▒╪▓╪د┘ affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(176,'2025-12-09 11:53:10.405180','11','╪┤╪▒┘â╪ر1 affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(177,'2025-12-09 11:54:09.198169','6','╪╣┘┘ê┘à ╪ص╪د╪│┘ê╪ذ - ┘â┘┘è╪ر ╪د┘╪ص╪د╪│┘ê╪ذ',1,'[{\"added\": {}}]',7,2),(178,'2025-12-09 11:54:22.258352','7','╪ز┘â┘┘ê┘┘ê╪ش┘è╪د ┘à╪╣┘┘ê┘à╪د╪ز - ┘â┘┘è╪ر ╪د┘╪ص╪د╪│┘ê╪ذ',1,'[{\"added\": {}}]',7,2),(179,'2025-12-09 12:08:05.843680','14','╪ح╪ذ╪▒╪د┘ç┘è┘à ╪د┘╪ص╪»╪د╪»',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (27)\"}}]',6,2),(180,'2025-12-09 12:12:51.609773','5','╪د╪ذ╪ز┘ç╪د┘ ┘à╪▒╪د╪»',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(181,'2025-12-09 12:14:05.521589','24','╪ح╪ذ╪▒╪د┘ç┘è┘à ╪د┘╪ذ┘╪╖╪ر',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(182,'2025-12-09 12:15:21.332381','18','╪┤╪▒┘â╪ر ╪«╪د╪▒╪ش┘è╪ر_1',2,'[{\"changed\": {\"fields\": [\"First name\", \"Phone\"]}}]',6,2),(183,'2025-12-09 12:16:34.543063','21','╪ح╪»╪د╪▒╪ر ╪ش╪د┘à╪╣╪ر _1',2,'[{\"changed\": {\"fields\": [\"First name\"]}}]',6,2),(184,'2025-12-09 12:17:27.249827','4','╪د┘┘╪د┘ ╪░┘è╪د╪ذ',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(185,'2025-12-09 12:18:44.182781','7','╪▒╪▓╪د┘ ╪»┘ç┘à╪┤',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(186,'2025-12-09 12:19:12.302763','20','╪د╪ص┘à╪» ╪╣┘╪د┘ê',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(187,'2025-12-09 12:19:33.889269','15','┘à╪▒┘ê╪ر ╪د┘┘ç╪د╪»┘è',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(188,'2025-12-09 12:19:56.805261','11','╪د╪ص┘à╪» ╪┤┘╪ذ┘è',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(189,'2025-12-09 12:22:53.669492','13','┘à┘ê╪│┘ë ╪د┘╪║╪▒╪د╪ذ',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(190,'2025-12-09 12:25:27.278719','12','╪د┘┘ê┘┘è╪» ╪د┘╪»╪╣┘è╪│',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(191,'2025-12-09 12:27:56.290858','23','┘╪ج╪د╪» ┘à╪▒╪┤╪»',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(192,'2025-12-09 12:29:52.510150','16','┘ê╪▓╪د╪▒╪ر_1',2,'[{\"changed\": {\"fields\": [\"First name\"]}}]',6,2),(193,'2025-12-09 12:30:07.460646','17','┘ê╪▓╪د╪▒╪ر_2',2,'[{\"changed\": {\"fields\": [\"First name\"]}}]',6,2),(194,'2025-12-09 12:32:53.235339','6','┘╪د╪╖┘à╪ر ╪د┘┘╪د╪ش┘è',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(195,'2025-12-09 12:33:14.299382','8','┘à┘┘è╪▒╪ر ┘à┘╪╡┘ê╪▒',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(196,'2025-12-09 12:34:33.677769','12','┘à┘ê╪│┘ë affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(197,'2025-12-09 12:35:34.505460','13','┘╪د╪╖┘à╪ر affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(198,'2025-12-09 12:35:55.716941','14','╪╣┘╪د┘ê affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(199,'2025-12-09 13:25:09.970572','25','┘à╪»┘è╪▒_1',1,'[{\"added\": {}}, {\"added\": {\"name\": \"user roles\", \"object\": \"UserRoles object (28)\"}}]',6,2),(200,'2025-12-09 13:25:36.318568','25','╪┤╪░╪د ╪»┘ç┘à╪┤',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Gender\"]}}]',6,2),(201,'2025-12-09 13:26:23.820127','15','┘à╪»┘è╪▒_1 affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(202,'2025-12-10 10:17:54.869934','29','┘à╪ص┘à╪»',3,'',6,2),(203,'2025-12-10 10:20:40.685602','30','╪ص╪│┘',3,'',6,2),(204,'2025-12-10 10:20:56.264985','31','┘ê╪د╪ص╪»',3,'',6,2),(205,'2025-12-10 10:38:20.824776','35','┘ê╪د╪ص╪»',3,'',6,2),(206,'2025-12-10 10:38:34.959013','37','┘ê╪ص┘è╪»',3,'',6,2),(207,'2025-12-10 10:56:15.032354','16','┘ê╪▓╪د╪▒╪ر1 affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(208,'2025-12-10 10:57:16.336278','16','┘ê╪▓╪د╪▒╪ر_1',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',6,2),(209,'2025-12-11 05:59:19.737319','17','╪┤┘╪ذ┘è affiliated with ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',1,'[{\"added\": {}}]',13,2),(210,'2025-12-11 08:40:19.088422','1','pro_1',1,'[{\"added\": {}}]',3,2),(211,'2025-12-11 08:41:02.554846','1','group_1',1,'[{\"added\": {}}, {\"added\": {\"name\": \"group members\", \"object\": \"Member \\u0627\\u0628\\u062a\\u0647\\u0627\\u0644 in Group group_1\"}}, {\"added\": {\"name\": \"group members\", \"object\": \"Member \\u0641\\u0627\\u0637\\u0645\\u0629 in Group group_1\"}}, {\"added\": {\"name\": \"group members\", \"object\": \"Member \\u0631\\u0632\\u0627\\u0646 in Group group_1\"}}, {\"added\": {\"name\": \"group supervisors\", \"object\": \"\\u0645\\u0634\\u0631\\u0641 \\u0625\\u0628\\u0631\\u0627\\u0647\\u064a\\u0645 for Group group_1\"}}]',9,2),(212,'2025-12-20 02:16:15.301536','11','╪د╪ص┘à╪» ╪┤┘╪ذ┘è',2,'[{\"changed\": {\"fields\": [\"User permissions\"]}}]',6,2),(213,'2025-12-23 10:59:08.343129','38','sss',3,'',6,2),(214,'2025-12-23 10:59:15.010054','28','╪ص╪│┘',3,'',6,2),(215,'2025-12-23 10:59:33.616132','27','╪╣┘à╪▒┘ê',3,'',6,2),(216,'2025-12-23 11:00:00.251967','4','╪د┘┘╪د┘ ╪░┘è╪د╪ذ',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',6,2),(217,'2025-12-30 02:54:12.169525','1','pro_1',2,'[{\"changed\": {\"fields\": [\"Type\", \"State\"]}}]',3,2),(218,'2025-12-30 07:47:17.346003','1','pro_1',2,'[{\"changed\": {\"fields\": [\"College\"]}}]',3,2),(219,'2026-01-03 16:13:44.640553','14','╪ح╪ذ╪▒╪د┘ç┘è┘à ╪د┘╪ص╪»╪د╪»',2,'[]',6,2),(220,'2026-01-04 06:01:13.441324','11','╪┤╪▒┘â╪ر1 - ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',2,'[]',13,2),(221,'2026-01-04 06:02:17.626568','18','╪┤╪▒┘â╪ر ╪«╪د╪▒╪ش┘è╪ر_1',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',6,2),(222,'2026-01-04 06:02:18.482287','18','╪┤╪▒┘â╪ر ╪«╪د╪▒╪ش┘è╪ر_1',2,'[{\"changed\": {\"fields\": [\"password\"]}}]',6,2),(223,'2026-01-04 06:09:25.937562','11','╪┤╪▒┘â╪ر1 - ╪ش╪د┘à╪╣╪ر ╪╡┘╪╣╪د╪ة',2,'[]',13,39),(224,'2026-01-04 06:10:49.063911','40','company',1,'[{\"added\": {}}]',6,39),(225,'2026-01-04 06:11:23.931284','40','company',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last login\", \"Gender\"]}}]',6,39),(226,'2026-01-04 06:11:38.653019','34','UserRoles object (34)',1,'[{\"added\": {}}]',14,39),(227,'2026-01-07 07:27:30.261561','1','project _start',1,'[{\"added\": {}}]',41,39),(228,'2026-01-07 07:28:04.698776','1','pattren_1',1,'[{\"added\": {}}, {\"added\": {\"name\": \"pattern stage assignment\", \"object\": \"pattren_1 -> project _start (Order: 1)\"}}]',38,39);
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (31,'account','emailaddress'),(32,'account','emailconfirmation'),(15,'admin','logentry'),(17,'auth','group'),(16,'auth','permission'),(29,'authtoken','token'),(30,'authtoken','tokenproxy'),(18,'contenttypes','contenttype'),(13,'core','academicaffiliation'),(24,'core','approvalrequest'),(26,'core','approvalsequence'),(22,'core','branch'),(20,'core','city'),(1,'core','college'),(40,'core','collegeprogresspattern'),(7,'core','department'),(39,'core','departmentprogresspattern'),(9,'core','group'),(36,'core','groupcreationrequest'),(27,'core','groupinvitation'),(37,'core','groupmemberapproval'),(10,'core','groupmembers'),(11,'core','groupsupervisors'),(8,'core','notification'),(25,'core','notificationlog'),(42,'core','patternstageassignment'),(44,'core','patternsubstageassignment'),(2,'core','permission'),(21,'core','program'),(38,'core','progresspattern'),(41,'core','progressstage'),(43,'core','progresssubstage'),(3,'core','project'),(4,'core','role'),(12,'core','rolepermission'),(45,'core','studentprogress'),(23,'core','systemsettings'),(5,'core','university'),(6,'core','user'),(14,'core','userroles'),(19,'sessions','session'),(28,'sites','site'),(33,'socialaccount','socialaccount'),(34,'socialaccount','socialapp'),(35,'socialaccount','socialtoken');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-11-06 05:57:57.735139'),(2,'contenttypes','0002_remove_content_type_name','2025-11-06 05:57:57.798072'),(3,'auth','0001_initial','2025-11-06 05:57:58.026344'),(4,'auth','0002_alter_permission_name_max_length','2025-11-06 05:57:58.080979'),(5,'auth','0003_alter_user_email_max_length','2025-11-06 05:57:58.091330'),(6,'auth','0004_alter_user_username_opts','2025-11-06 05:57:58.102307'),(7,'auth','0005_alter_user_last_login_null','2025-11-06 05:57:58.112206'),(8,'auth','0006_require_contenttypes_0002','2025-11-06 05:57:58.114977'),(9,'auth','0007_alter_validators_add_error_messages','2025-11-06 05:57:58.125935'),(10,'auth','0008_alter_user_username_max_length','2025-11-06 05:57:58.132384'),(11,'auth','0009_alter_user_last_name_max_length','2025-11-06 05:57:58.138000'),(12,'auth','0010_alter_group_name_max_length','2025-11-06 05:57:58.174969'),(13,'auth','0011_update_proxy_permissions','2025-11-06 05:57:58.180559'),(14,'auth','0012_alter_user_first_name_max_length','2025-11-06 05:57:58.185831'),(15,'core','0001_initial','2025-11-06 05:57:59.343873'),(16,'admin','0001_initial','2025-11-06 05:57:59.462457'),(17,'admin','0002_logentry_remove_auto_add','2025-11-06 05:57:59.476517'),(18,'admin','0003_logentry_add_action_flag_choices','2025-11-06 05:57:59.491645'),(19,'sessions','0001_initial','2025-11-06 05:57:59.532564'),(20,'core','0002_city_university_type_user_gender_university_city_and_more','2025-11-11 07:33:19.914453'),(21,'core','0003_rename_city_id_city_bid_rename_name_city_bname_ar_and_more','2025-11-19 06:41:52.012667'),(22,'account','0001_initial','2025-12-03 14:52:06.043458'),(23,'account','0002_email_max_length','2025-12-03 14:52:06.091676'),(24,'account','0003_alter_emailaddress_create_unique_verified_email','2025-12-03 14:52:06.134071'),(25,'account','0004_alter_emailaddress_drop_unique_email','2025-12-03 14:52:06.563573'),(26,'account','0005_emailaddress_idx_upper_email','2025-12-03 14:52:06.573352'),(27,'account','0006_emailaddress_lower','2025-12-03 14:52:06.593062'),(28,'account','0007_emailaddress_idx_email','2025-12-03 14:52:06.633869'),(29,'account','0008_emailaddress_unique_primary_email_fixup','2025-12-03 14:52:06.652205'),(30,'account','0009_emailaddress_unique_primary_email','2025-12-03 14:52:06.675910'),(31,'authtoken','0001_initial','2025-12-03 14:52:06.729392'),(32,'authtoken','0002_auto_20160226_1747','2025-12-03 14:52:06.771219'),(33,'authtoken','0003_tokenproxy','2025-12-03 14:52:06.775044'),(34,'authtoken','0004_alter_tokenproxy_options','2025-12-03 14:52:06.779268'),(35,'core','0004_systemsettings_academicaffiliation_college_and_more','2025-12-03 14:52:07.393460'),(36,'sites','0001_initial','2025-12-03 14:52:07.409271'),(37,'sites','0002_alter_domain_unique','2025-12-03 14:52:07.433017'),(38,'socialaccount','0001_initial','2025-12-03 14:52:07.760784'),(39,'socialaccount','0002_token_max_lengths','2025-12-03 14:52:07.863303'),(40,'socialaccount','0003_extra_data_default_dict','2025-12-03 14:52:07.875465'),(41,'socialaccount','0004_app_provider_id_settings','2025-12-03 14:52:07.976068'),(42,'socialaccount','0005_socialtoken_nullable_app','2025-12-03 14:52:08.250082'),(43,'socialaccount','0006_alter_socialaccount_extra_data','2025-12-03 14:52:08.342482'),(44,'core','0005_alter_approvalrequest_options_and_more','2025-12-20 03:15:56.007179'),(45,'core','0006_project_college_alter_notificationlog_title_and_more','2025-12-23 10:42:03.123027'),(46,'core','0007_alter_approvalsequence_sequence_type','2025-12-30 07:50:00.036734'),(47,'core','0008_alter_approvalsequence_sequence_type_and_more','2025-12-31 02:51:57.726668'),(48,'core','0009_project_created_by','2026-01-04 05:45:37.429213'),(49,'core','0010_groupproject','2026-01-07 06:43:57.678598'),(50,'core','0011_alter_approvalsequence_options_and_more','2026-01-07 06:43:59.623145'),(51,'core','0012_alter_progresspattern_options_and_more','2026-01-07 06:53:59.394125'),(52,'core','0013_alter_group_options_remove_group_created_at_and_more','2026-01-07 07:04:38.001529'),(53,'core','0014_group_created_at_group_department','2026-01-07 07:04:38.157607'),(54,'core','0015_progresssubstage_patternsubstageassignment','2026-01-11 23:15:52.303933'),(55,'core','0016_studentprogress','2026-01-12 18:16:52.495339'),(56,'core','0017_delete_studentprogress','2026-01-12 20:11:40.682822'),(57,'core','0018_studentprogress','2026-01-12 20:11:40.851090');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('02abi34ed9r9x2dz1m4n2fio0pj5lsg6','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vauqA:AEt_Tn9Npx3cjilLXm5G8dChpvkOpNP8BxlLxHg8Pic','2026-01-14 11:58:10.386814'),('06xtkuurrlz7dmhdg9xqjyzdun4r5urf','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbew0:tUyQKB43UCC5pXaplT8vVh9goUAd2QCD7tmFsRtpenE','2026-01-16 13:11:16.643084'),('0abp8dwteou8cpj384eihmvaojm1lro1','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcHMc:qerZcV3l3Wssv8qSOuJSOqvIauGI4AtuElkwR3ZFSPE','2026-01-18 06:13:18.737693'),('0b5ah4l8n37zlvlkjpv7ubzxiyizrrcd','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcg9I:EWNm_N_dXvx4UYMpL62DxgWoY8K4qWo59QljX04Uxnc','2026-01-19 08:41:12.807384'),('0pkqi1llvmqyoqwobbjf55e35w5t8hpu','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTQG5:o1GTlV9drXEI_Xr9cLfzZ938__QC5Qej4iWPZrjUAGU','2025-12-24 19:53:57.268714'),('0s4f75d2822bikgzj5vhjv8hsqb86yvw','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vaqfo:gLStmicZGMy7Xl3KTGxdWq38N9riuaWQHFcaci8qzvU','2026-01-14 07:31:12.757967'),('0xucij52cl7emo97mw7hg1ul0ddgdpz7','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vf5HN:pA6a_qOLk9PHsPrSqdl-JZqTzmZaFaEeXPxPk36VpqI','2026-01-25 23:55:29.330097'),('16cpbj5arz9t9hasrkst5hqct064qv11','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vTFdB:5BUmZVbBmzqMQvhbpBzNT0oAEgwAro_GpfdB7LVKBiM','2025-12-24 08:33:05.790316'),('1892r9g1x33g58mdtf0uvz3m5hdq3j9a','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbflK:FTvDFhIQKRTV4s_SFUVqivGf4ghwoteXcvnUb4FeMcQ','2026-01-16 14:04:18.862997'),('18josz63kbc4sujs041xqg95u36ppfuq','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbgAN:xxlAqAyoY4UNYvE_yxY5vToKtFUvuBNJDz7fqzeTEWU','2026-01-16 14:30:11.018142'),('1a0q7y3m3wmpikcbjz1g6pgofcuo0o6b','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcIV5:5GhE0h020ie6Gb3eVM1MuPisOCb7a98q_OgXy6zrL1c','2026-01-18 07:26:07.115375'),('1b8gi8qcxl6o9cgnvnw659pocin5ikiy','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vXfuP:BsYVJsAI8yRd3wiVEHZCtiWBzbPBetxJnwNQX49kXJ0','2026-01-05 13:25:09.185535'),('1dzp81efo7eojvua48diuh85a10akp7i','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc3VC:wtzxCsnbVj88lDGORZtKvtdWsv_-FYfF0Q0SMPaBPyo','2026-01-17 15:25:14.274947'),('1h8j1pt15pclcd2f722f4q9uf3395u3o','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vUMBL:ZdX3QAaHl1zgUfwOXeS_ai8kTovYM0-UoGA3YbLI6VI','2025-12-27 09:44:55.965705'),('1jinml88wkbjbg1ya0la414ldcytibkw','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vTvHx:-zYmfyWmZC7YHroTpvXqwGt6Pvryfv0e0dvMpEJe34c','2025-12-26 05:01:57.210551'),('1k58etbcp4v0w96g147cxyi3n6a99285','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSsBq:J1I1O1LJdOhN6Rw4dH3IZqvZfmUoOai4nKlF2sBWI_E','2025-12-23 07:31:18.129088'),('1r7rmko43fh78daih9rahps5qbhzaidi','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcmrQ:Ht0mYgA15QnRneBa2fnRKPTbKP53WMzNAdf-kRj2O4w','2026-01-19 15:51:12.355560'),('1up13nhooo9emwnioku099qy7kem6qy5','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbewb:rTXpqiszZihkhtwN92_1rgzuQHwszBYvBMctE0JUCts','2026-01-16 13:11:53.902997'),('1xcluo0y73rqohdshkgck0ti76we27p8','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vaufs:CkWSXU0aDirNxCtXjUn8iNvx67ofQJ98qnm4Gb7y8CA','2026-01-14 11:47:32.730645'),('1ypigs0ey2xoqg3ovj99gzxn3y9doivi','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vf5HB:kkk6tzHRtFU5VbzQxPivQ5P8oDSV1gsKiR95C4d6dEk','2026-01-25 23:55:17.521850'),('256kv80rw0vu68epuihqbbqc1jaoti3r','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vaPSb:5dr4IZuazzITn6N4ZCjfLqLx2uOMM4bZgbp7mqxnezk','2026-01-13 02:27:45.939221'),('26nq886s0rsilzp3ywe74yyoq3vxxdhg','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcDln:4royCgQn7-K-5TQmyf0DiJBhO0bdsmxpUROUysLGjgA','2026-01-18 02:23:03.583890'),('2gxdhgzoaz1bmnucrv140i4glxz8hy50','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbgi0:WEgip6EbeahZw75KFLQ7c7k9kdfUlgpYu7uPUAJs4ek','2026-01-16 15:04:56.461306'),('2klx41zkwkmq5dnsbgfz9i4f80c2yfxv','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcDjv:cemAirCIpAqEiV_4by2Ch1_NrwHpefoGTLsJUcAMlys','2026-01-18 02:21:07.746230'),('2vzjwtb84boda9kq8d4p5y8uwoag93vl','.eJxVjDsOwjAQBe_iGln4mw0lPWew1vYuDiBbipMKcXcSKQW0b2beWwRclxLWTnOYsrgIK06_W8T0pLqD_MB6bzK1usxTlLsiD9rlrWV6XQ_376BgL1sdPVHO6OCsB6_AIYGyOtkxGgUqOQ3MjvTIrFgbzzgY5RNYB3rzKInPF-LRN38:1vXfFw:jaGkZKOTzhPsVO3qt8ZIuv55dw0R5imWniozWFkJjcw','2026-01-05 12:43:20.746235'),('2wekrrljhnrf32z4j0ij4uda1fmjxe1q','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vaPhz:k2qB0yGnbJI1JT316yoDiFtgUfTcGqc3NrWVdiwKI0k','2026-01-13 02:43:39.581405'),('2wnfixxtdoifeja9aoebogqzxggq640k','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vapjJ:ktfG0Kjr34ZpfV1LxSRWLkBMW-Vy7XrGTbmrbzrLmn8','2026-01-14 06:30:45.866847'),('30f7uf03xyjclxzpyc8bsg66r9cq81xi','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vTHwL:CPxUxmDLq8-zj9wirqdQiHmCgAxUqzj-kRzN_AT_tn4','2025-12-24 11:01:01.711693'),('32ij06epqz4t9xsd3lp8alw59apenp4i','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSwPr:nJ6kEFT-1Noif2A1-kfiwRJREA7qpBuTRaVY7lZU7Dc','2025-12-23 12:02:03.896894'),('3ctcy3exgl3gpcavbcago567t8tny13i','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1varGK:jxo20YvGnhEgl8f0s80Uf48k7F3Ja2aYUl4LS3LYMeQ','2026-01-14 08:08:56.964521'),('3fn8r9rie8myryh8ims5xs6iu6qtf96h','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc1wM:z1vIwf9dmAeAKHuiBX-nHPuNw2f9oJkzbjiOQ95Puv8','2026-01-17 13:45:10.927866'),('3jxpzkv35i8czhejtpfbcg8fzzo9sum6','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vaqr9:VP9CGa1CQ4bblwuo4-j8kASc9uUnFkIG0uVPuu4mzTI','2026-01-14 07:42:55.740503'),('3k8fi6rxfvdpeiu769xhcsw09ol0tshb','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vaOPC:Obb1TP77UyBRlz8WOChybAWScLYJMN1SssH89HNA09E','2026-01-13 01:20:10.434713'),('3lpsnwdag2uoj4ktketit8y5jixpxka1','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vTEse:gaOt_QntB4tOC8cq97VCOKYH5MhCoZpofNvXQClw1K4','2025-12-24 07:45:00.401710'),('3x5hlu423b3wpvxz6ctekhtjtla05vjb','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcNk6:d7hK8g3mHpAEUik2VyBT6XWxkQdpHjr-Q4XhjcHQuyM','2026-01-18 13:01:58.328017'),('3xm3enk0tth0mkfed2bpybkhttk45gzq','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vaPgz:veKg4z-DCDmu-9i_44eKXbn0tUzUbTiZ1fIqKwtCmFI','2026-01-13 02:42:37.452616'),('44bjiwja3lvtx337fgwcz7udk4yxmc43','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vXf8v:FjpyUmROXF53MPilgfOIdsVzOgg3VckimkpAvrpJp9U','2026-01-05 12:36:05.383545'),('49diwzmyest9tv05gi3tawf48zc7cu71','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcefM:r5Ba85i-vMMcQq-q3XpQWx8zH8mZXH27rUeF2HbSL7Y','2026-01-19 07:06:12.364694'),('4ihlvgxc8ute4urthxdhc9k9w64ajuij','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbg7N:-V3LmdGP9cL67gG0rs0SJeAQ4BeFvYc2O7eugVDN-KE','2026-01-16 14:27:05.999957'),('4jlf9sw2cmta6wde8o6sk8k5h7ldqgmg','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vcHBx:10xTs5WV7B7PphEh8fnwtxToCoKw5nsRprTZb34dPpM','2026-01-18 06:02:17.629881'),('4m5gmvmk1zz9n27o5aie0qnzgxeytghf','.eJxVjEEOwiAQRe_C2pDCgAwu3fcMZGBAqoYmpV0Z765NutDtf-_9lwi0rTVsPS9hYnERSpx-t0jpkdsO-E7tNss0t3WZotwVedAux5nz83q4fweVev3WOhdUxgAiQ9YZMYLWAGCNs2dbhpIKG-tjIZdsUkjOMyut_GCAbSTx_gDJ8jd7:1vScGD:rtiXgnSoUQMQjSBUMWq-qBn-PErmWMUQckRm9VnJXow','2025-12-22 14:30:45.551787'),('4rrixpmsg5ksmb6wbwey06wa9q8gda4w','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vY0Cg:9PD_2VhjZR8GDOGddpMzqExr1DQazOeBir9pUPn_VvI','2026-01-06 11:05:22.414760'),('4tgvq99kgl3u8djl2bo4stg4vrqle1ow','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vY0Cw:5DkuvJK34rWEroNXKtglXWIqYEfxA57SEYgdUYw8CJU','2026-01-06 11:05:38.924925'),('4ueyff7cimf8fusbqmy05clvftns98zc','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vaqyz:jxX6ilaCGL98NY0Jar6lkfyiZKfvvGq9fPrCJUZT6mw','2026-01-14 07:51:01.545408'),('4xsf7okaalwp15h14e00krcyotlkxr59','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbflU:rXtQoFLMEjmcQoEJAzsnweqyhcP9bvJaJBNqz7yAVP8','2026-01-16 14:04:28.500718'),('5b8uwfeypeu18hw443nl52rfj4zjuasa','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vceau:KrIvGweTdy9rWkJftYSpc2WFLWQnW3_yBp3bW-RuzTA','2026-01-19 07:01:36.817639'),('5cdesvvl95qetals2eaz6d98zegyljqi','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWsng:uTZx16I5WiTU7u8IFwdYHL8JlCb0KrXxQdlzuoeuScI','2026-01-03 08:58:56.998657'),('5do4ti8wgm0fbhjmrdmt2im1w308fatu','.eJxVjDsOwjAQBe_iGln4mw0lPWew1vYuDiBbipMKcXcSKQW0b2beWwRclxLWTnOYsrgIK06_W8T0pLqD_MB6bzK1usxTlLsiD9rlrWV6XQ_376BgL1sdPVHO6OCsB6_AIYGyOtkxGgUqOQ3MjvTIrFgbzzgY5RNYB3rzKInPF-LRN38:1vUMB9:dk8aJA_jr8yP2BBW_34GrKoH_D8zx3QQynNdMnobm88','2025-12-27 09:44:43.791524'),('5imk6sne2j8at47wzxn0t60lksip267u','.eJxVjEsOwjAMBe-SNYrqVHFSluw5Q2TXMSmgROpnhbg7VOoCtm9m3ssk2taStiXPaRJzNmBOvxvT-Mh1B3Knemt2bHWdJ7a7Yg-62GuT_Lwc7t9BoaV86-h6FMAwoCq7oWMHgv2oAlEJRYAJMUP0oB4GIvbBO-1YNOQuQG_eH-IaOAA:1vHOwA:-9MhN1YBCkYEV_VjjBfalGulCnlnx8iS0bEhE6Gx_jQ','2025-11-21 16:03:42.093037'),('5phqassvtw0ly8y94cj850np955u7dhr','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcJWI:nUrxdw4eFkS4L-39_VgtA9aWxoQ7BUeSrM3izvU8xNU','2026-01-18 08:31:26.859930'),('5qrnkjuprtzzm8yv12xr9ugkkqap1o8n','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vaqgI:Ew6aS_tZvE6oMqTW_TeSBNlii5qa4H3oQ8Tq0fAav80','2026-01-14 07:31:42.293233'),('5t983f8f19o0whba3wqnz580unhx344h','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vaPW8:IZ6mKed8HoMg-ApS84w_Mz32sKJjH7BOG60OVIvjq00','2026-01-13 02:31:24.395462'),('5ugnfpuf2wa8x51puj3ykhbk98h92tba','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vaPmp:gf-HUyLJQRArAqjMYB-fruquA2U5sE5Q4UGfSqvwLOU','2026-01-13 02:48:39.906957'),('5we74u8mzr9vqcu0gd35ekexgdzip7n9','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vaqBq:TYItceOYCu73qXy-eZiQa6ibpNkhaiZwo1N39TsZ0K4','2026-01-14 07:00:14.536003'),('5z2ocstu6ge91qmi33jntfcj9idw3ao2','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vSxjf:uqjO3lUG12BKwvoHaGCxVMWfAvTxut4DrNfLqlHJAy8','2025-12-23 13:26:35.945962'),('63kqj4lkw4u0xpmorvtpe7wd5ct8z3ew','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vaPhr:0_9ZQMswlhzMKIYyP_5g-ewrcu7erVwG6tyjJs-rN0I','2026-01-13 02:43:31.934866'),('642s5l2uya7b0cavoxyg95xx08o0xn0q','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTD6M:TcjAkeQxUKZbCIuvh3oRb4akcnlx77lguIe_idUAZ5M','2025-12-24 05:51:02.254284'),('655xd1rogi5hta82a19n7e04s16jemgw','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfrw:O7Hodqql2c0gXEWdvYaN1WBHHFRp4SxAPs4gAGaTcUY','2026-01-16 14:11:08.694132'),('6aea5zjkatqny00sq0u91ydx0kktdo35','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vaqg3:hslV5pk5F4lXHq9ezFI3vmSV2Ecg3JKs5iC794KskBA','2026-01-14 07:31:27.804382'),('6cp12yjx8zwnzrpn96ab3nqumtegf8k6','.eJxVjDsOwjAQBe_iGln4mw0lPWew1vYuDiBbipMKcXcSKQW0b2beWwRclxLWTnOYsrgIK06_W8T0pLqD_MB6bzK1usxTlLsiD9rlrWV6XQ_376BgL1sdPVHO6OCsB6_AIYGyOtkxGgUqOQ3MjvTIrFgbzzgY5RNYB3rzKInPF-LRN38:1vXfCv:_QNuAUgVvEJY7F-gxGgNU0GOkwnOt_q7xF38OYo6FzY','2026-01-05 12:40:13.210868'),('6i7kiorvjkiffdldf3ohvmeaw5aubmmu','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2EJ:aEqGOmEtbnqYkH6NZL8MaXnTjdUkXcRm8E6CjFePF-Y','2026-01-17 14:03:43.475258'),('6jjsqv7um822qged6ar8ig7ncji443ds','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vTPdt:k988hJYSiUM4oKQn03z7ir4exJFpMxbxpBwg3x7QZv8','2025-12-24 19:14:29.731454'),('6k0fm9crt4dh8vdx1yf7ipg5z9xt9wyw','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcJX3:erExBrKqnpXfTh9eiPbokuHgVf-TxMi2DSkGdzg0dt4','2026-01-18 08:32:13.800207'),('6k8wsdyw3pc7mii15s56d05wdsxhe7bv','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfqa:WkexH1p1PT2XjOTtZM0aFyAnxm0lSMnXvi-cq66RIEI','2026-01-16 14:09:44.950914'),('6r5e4auj45pwskcctmse3i8ehvafgqeg','.eJxVjDsOwyAQBe9CHSHAfFOm9xkQ612CkwgkY1dR7h5bcpG0b2bem8W0rSVunZY4I7syxS6_G6TpSfUA-Ej13vjU6rrMwA-Fn7TzsSG9bqf7d1BSL3strFGDk8EOFLQjIRE9WglKCE85BRC0G04jOQsKjR40ZC-DUsZClo59vriaNuk:1vSdUN:Jtc4KgT0jEnzWuIwqqoozlYwhAzZM2ZRFo3v4gEVEPc','2025-12-22 15:49:27.367930'),('6w1fdfu4f4mgvnuyws6ra0d8t4fanb02','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbsSZ:m6NJeH_8Re41xXgbN7eBb_oJj6tICWcdTzl-vSXSklU','2026-01-17 03:37:47.591869'),('71k1je6gyxs3e5vz5o2q118zec1enfmy','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vauWH:ocB7mtWqS09-ZtfQM80g-yhQ8w2RoVGFkxFKPWMJaJo','2026-01-14 11:37:37.142620'),('721chzhwooe7xgbute5lju8wa4cqt3z7','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTdwf:DO3e1sgCiCHprQtn8R1xxgueo2taaQfwLk8r5sVJdoo','2025-12-25 10:30:49.492401'),('76q8rmj4vqpd6oe0uls4vxfvfqm99n4r','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vSsIu:aONJKpKA3VqXXZDQGUiLsKdOE-fkhqQsgjnlqx4u6sw','2025-12-23 07:38:36.268526'),('76qepphxwtviqgjtqoxeqwze2xaj9oxq','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTkL1:v117XhbLI3lMNts1ocINzS3Q-YfvZlyv_3tEizpPPJk','2025-12-25 17:20:23.952360'),('7akmwmzvfhj5uzh0cizvj9vp43qwvwy0','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSww4:1x5xbJL-3WvR4-SvkRDpf3hO2WJNfzwni9OHXLO8FP0','2025-12-23 12:35:20.956230'),('7t1w6psoh5yku82j1qudnseno69qm7wj','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbuaw:xZ9xvu9xrtaS_QBhS-Op9zVTxFJ4Qzlmwlonzjv81Wo','2026-01-17 05:54:34.875925'),('8avkt3gqbwwgx4dgyrf9vfzquh13whly','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vaquL:sy26Hu8x7KMQ0ak6Fyfv8wHL7HelDH0hoJZnRo8r-J0','2026-01-14 07:46:13.948354'),('8awummllzwuef6b1xmfteyqir7m3amsp','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vap5Q:SlI6ZGrNn2gnfAhvhswTUgTQxvOU9bWslFcqcGGvY9c','2026-01-14 05:49:32.373895'),('8dtjwg3fcscm2x2uqgqcxfixwr9j2vq9','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcdqu:cWVLlu878pcTnk3_-XTNdRFORq-iBFvyL6g48L_AdfA','2026-01-19 06:14:04.230445'),('8jya1go1i48gwgfye33m7joufz8klg6f','.eJxVjEsOwjAMBe-SNYrqVHFSluw5Q2TXMSmgROpnhbg7VOoCtm9m3ssk2taStiXPaRJzNmBOvxvT-Mh1B3Knemt2bHWdJ7a7Yg-62GuT_Lwc7t9BoaV86-h6FMAwoCq7oWMHgv2oAlEJRYAJMUP0oB4GIvbBO-1YNOQuQG_eH-IaOAA:1vHOwC:_M0Ix7K4e3trU_qXT9-sy92-nI_h5Yl_4EpQ7ZrN-3U','2025-11-21 16:03:44.077855'),('8p5uvf0mcoa9ydx2wf5xqkxn1ixi3183','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vaPXe:xqIC9IaNraBxSQ1KwK6F9hU90y7qrJ_6-Y5SB0BTBys','2026-01-13 02:32:58.326495'),('8snktahyv6726b457lqxcjm8h2rs6mdo','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSwe2:VLTqnCB2bN92fLUsp4lu7gdsZX8gH_rQzsOwJ3603lU','2025-12-23 12:16:42.721506'),('8sph0b9i9698sqv4wln9huliqkq45jsx','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcQB3:1qn7cDuk-Cvy9BnXiX8I4y1-SrmgOu38ZJLXdPWLlRQ','2026-01-18 15:37:57.750141'),('8wzobyya6wp2035n8ly2bynlmgzci1tl','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vX0e3:lVRG2wxXqCqIVX3Q8RDwe8YbjxMs4g_IiKRifYVjJm0','2026-01-03 17:21:31.386544'),('8xhytjkylbggv347ai8yfnh4gu8rw37o','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vavHD:EEkdGKww9g2G8sbwrSUzCWAz02POMud-Ge35cI2QJpc','2026-01-14 12:26:07.553259'),('91sv90xpjw8ag9wh13m9duvmpd2d7sd6','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWnxu:XpQn-pUw2OJ3WoVhqomIOAijkdlKxvA0g7GU0r9lI-4','2026-01-03 03:49:10.124127'),('9cy74y6pbaaainthpr90phkflbqce020','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vTICF:VykfoJP_90RVZTFZo36uNaE954NG2hY3Ot38_ppU0Kc','2025-12-24 11:17:27.926797'),('9g35zx4z12kv6nlpbrbws2q51pg9vlmm','.eJxVjDsOwjAQBe_iGln4mw0lPWew1vYuDiBbipMKcXcSKQW0b2beWwRclxLWTnOYsrgIK06_W8T0pLqD_MB6bzK1usxTlLsiD9rlrWV6XQ_376BgL1sdPVHO6OCsB6_AIYGyOtkxGgUqOQ3MjvTIrFgbzzgY5RNYB3rzKInPF-LRN38:1vXwna:vPAXgR6tobVcrSzv8WQcPqdG2DZTucJ9Z_iXrWh_lzw','2026-01-06 07:27:14.480916'),('9hjddud1ubjohts4okpqmtbxumvwh2yw','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vcPzN:ulf2Y0Q2949WLvECeNNnAmbZnJdH-t3Kggr8oc21WK4','2026-01-18 15:25:53.526920'),('9ntegezxf3u5cyq89h9rdklpx4o4pzjo','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcJaT:EFy6g6sUw0DQUhDQAYlegpsXEYIdvI5QBp5VknMV-EA','2026-01-18 08:35:45.324959'),('9pez6bwt8u6oc77l23ui7z9pvs27ccwa','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcNfH:6vqU86YjfBhgAF_qWpQuqwnvRPO2ndF8TqLnmqv_JVc','2026-01-18 12:56:59.849075'),('9vflqnrq83iym1clfupwirokqtowplsj','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vTSHQ:I1ZWYHoxaq01sWnc6juWIQRqZUTcOawVIhjex_i2Y5U','2025-12-24 22:03:28.735636'),('afwgkcu7xrqsh1dljqlnimpaaczpfx5w','.eJxVjDsOwjAQBe_iGln4mw0lPWew1vYuDiBbipMKcXcSKQW0b2beWwRclxLWTnOYsrgIK06_W8T0pLqD_MB6bzK1usxTlLsiD9rlrWV6XQ_376BgL1sdPVHO6OCsB6_AIYGyOtkxGgUqOQ3MjvTIrFgbzzgY5RNYB3rzKInPF-LRN38:1vXwoN:Dfil5msJOr0jk4altEIaZYVgFC0_-eL_kNXku2dyZfE','2026-01-06 07:28:03.163992'),('ahidavyu8t17ecu53a581x1xbab3iuh3','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1varG1:PRuLOSOv3myK9wEtoObUa4Qoqbfgtv3rekkhqXdfBIg','2026-01-14 08:08:37.673510'),('aiccg0ngozx8puzvd4p0jf9ptfjfnf1s','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcdpM:IC5uUJJu29OSecHwgPNxF2R8uydVbQtMPeiF-nXVAZg','2026-01-19 06:12:28.304372'),('along3edon04s9h635g1ivg18rgje9r4','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSsFZ:eoCnOqHLXtlxU2WxNe48bG_vDcRYU4AjYrK8Tk6qLN4','2025-12-23 07:35:09.563783'),('anb6awocophv2ul31972acfyf4i3viai','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfmi:h1RukgH0iSRqX5B1147ap1FvyDBB7iNRdgm1KASZbUo','2026-01-16 14:05:44.778498'),('asty6xyweje1nwdamphwonbms2pdacwr','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc1rI:GbQCTqlTeBYt1vwvhdDyDUOYSHIoMjUtIpoBvmSms8Q','2026-01-17 13:39:56.838849'),('ax5o07jtp6q0o3rjru74s4w7kwnemrlb','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcaPH:RrTTLdcerSrkKwFQyM6lCexHUztrfXxTB2zY1Ja1ywU','2026-01-19 02:33:19.573017'),('axavua25ic6tmofdu0zuy1je5t0fw4q1','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vV5LW:YQ794bSiFcEgrdm5C5d4WW7-0ZPxB77kqxeI1wGI7a0','2025-12-29 09:58:26.040249'),('b126n94i4dtea2e9ljpyisbqnz581inu','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2TA:DrReYaZ3eCmyvZp3TtlbmJZTBD7BnTcktPeMrBNKeKo','2026-01-17 14:19:04.654334'),('b3l6dx1xygv6mbdzyzwncej60tv9ms4u','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vUvQ8:s5pRZj05oqs7PXhI3rZavkqnoPLLiUPRTnWojyIJYz8','2025-12-28 23:22:32.790556'),('b5a7n26ljyyemhd15qd2vslb57b5wv6j','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vUMAn:wmYduNZNSXlXKNLRoBWCsOGtZdpWcliUoscGEIIIV0c','2025-12-27 09:44:21.963066'),('bmkull7gxnctddrv81j1xkpj35ixxt0u','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbu9l:yog_HPGBOFPnDqO9y80eu0BzQBzMOemTd4mMWhytl4Y','2026-01-17 05:26:29.510990'),('br42p87hw0ec0hr90u9sf0r7ff8h755y','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vXf8D:9S5IFYVpyXWXt6vk3DllGlVt1VHqidhoqUUFV8tJZI0','2026-01-05 12:35:21.630902'),('bujkwfx0ooj78gpj6odolvg29ncvgw6y','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vf4M3:Stl40ypGK1-82fA4oiDKCKNGa7YsifD4OCS0gLQXd_k','2026-01-25 22:56:15.732516'),('c9kffeszud4ub3t99s2jimc4y8svtoax','.eJxVjMsOwiAQRf-FtSFACQ-X7v0GMswMUjWQlHZl_Hdt0oVu7znnvkSCba1pG7ykmcRZGC1Ov2MGfHDbCd2h3brE3tZlznJX5EGHvHbi5-Vw_w4qjPqteQJEp01gQ4QKdA7B-UAMPupYQLuYI5jMYYrBglXaKVu8z9YSFkTx_gAdkzib:1vTDKd:E84i0Y5WfwIvKMsesi25zZJTpWvlgdVn4b2KPH9uLUw','2025-12-24 06:05:47.892422'),('cemaih1b9knd8l3q0wfh4wlstsr7h1qs','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfK2:ry7UuQpeiWcq0oy1hQlnncoKKWwD4eVArFIihcXXaek','2026-01-16 13:36:06.804371'),('clw0d2lo7d8iyrxv0zuo52obev7at29i','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcaRw:v8yQTjH182L8kpsNMVNjFc2ZiV3BA2asHG6TAcmsUxc','2026-01-19 02:36:04.812287'),('coh2vqo18euhpac1zfn6p16udiqr8i7b','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2hg:s8jgfxTyne0sJLuKCmAeDj6vfERn5v22Ip8AevS-oIE','2026-01-17 14:34:04.492973'),('cw3hl0k6oh6n8mvi5yc7vybyq5wi0uwc','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcdqk:eOVwhQaqiRRLDFvQWpdIhfyOtM0T1lOuG9P4A4AGAmg','2026-01-19 06:13:54.828220'),('cwajd2bz941gtafz731i7yfemcr7i9dg','.eJxVjEEOwiAQRe_C2pDCgAwu3fcMZGBAqoYmpV0Z765NutDtf-_9lwi0rTVsPS9hYnERSpx-t0jpkdsO-E7tNss0t3WZotwVedAux5nz83q4fweVev3WOhdUxgAiQ9YZMYLWAGCNs2dbhpIKG-tjIZdsUkjOMyut_GCAbSTx_gDJ8jd7:1vRQJP:QbeUITUROMWpkPoizlFcRviBgn5ZroCuSTd9WLatUdQ','2025-12-19 07:33:07.332781'),('cx23gmfzc2693o6ds9ks4pdebi03hjw5','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2fR:zBME_YlM71PkyaFJyWmXx7zRIsKNeVAeNRRlhCB8-IQ','2026-01-17 14:31:45.528448'),('db1k7jvd6oeh0b1kbvdf4t1495uy85c3','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vaOtf:Q0d4DPYd2dy8eD1gD0dWVg-Ka7Sif7aHTzSXNAAn50w','2026-01-13 01:51:39.385182'),('dir2xidfgw4xd1qd2vkbq06fwz0836rq','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vbg6B:pSXCN62nusNDgkrtfFk-_OlyQ25hDDxOkuqu_Bw_RwM','2026-01-16 14:25:51.327811'),('dq9mkhht42litj3vao0i605nxzjre0ci','.eJxVjMsOwiAQRf-FtSFACQ-X7v0GMswMUjWQlHZl_Hdt0oVu7znnvkSCba1pG7ykmcRZGC1Ov2MGfHDbCd2h3brE3tZlznJX5EGHvHbi5-Vw_w4qjPqteQJEp01gQ4QKdA7B-UAMPupYQLuYI5jMYYrBglXaKVu8z9YSFkTx_gAdkzib:1vUMAx:se3EYuyKoiEHUg9Nnr2u0ACgKgKAv45Ib_ib2d7c33U','2025-12-27 09:44:31.223769'),('drqy2qii2h1ylqusau1dgr65aon0ecj4','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2VC:Qge-x6e1pJ2gVsaCl1S8qFvNRQ3BdjZcbuVtZ7TNIXk','2026-01-17 14:21:10.868115'),('dt61v1c7likk5bc021jql65xi82nf0j3','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vaPmz:psU-yXadDbYwLxIoxNfSU05nk-7_8g78_eE4TP1AWcM','2026-01-13 02:48:49.340794'),('dtnntlcoknnvu40s70ujvvbt8jr8fadj','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vTS9x:ua8Mf22rOKJdi7pZLgx-kmrOivknNt7h35gHi-cg84U','2025-12-24 21:55:45.037414'),('dwqwc6nylmxwi9007kxvyzywecrjnftr','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vV25l:FbVLJ-HzGAG51q1x0XsNbo319R60aJuuWEvenIo0NQY','2025-12-29 06:29:57.684584'),('dz4uqep284on5juy8yoquv5lsql1e72d','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc1jg:mETCrf4DRIswxUEZ7G4CV1K6cG862hhj5dU-tYqvTHQ','2026-01-17 13:32:04.610840'),('dztrc0sf5aubtkgwfjl8nl18k90uqc5x','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vaqjp:bay5V3RXPWWg8MohBPZ9AP1G7rwdLHfgVseeNJq0XkE','2026-01-14 07:35:21.724903'),('eccm1wreqjet3d46vtyeavmp4acx96hd','.eJxVjDsOwjAQBe_iGln4mw0lPWew1vYuDiBbipMKcXcSKQW0b2beWwRclxLWTnOYsrgIK06_W8T0pLqD_MB6bzK1usxTlLsiD9rlrWV6XQ_376BgL1sdPVHO6OCsB6_AIYGyOtkxGgUqOQ3MjvTIrFgbzzgY5RNYB3rzKInPF-LRN38:1vTZ4U:HhoULIWeUpNUJm17RSC_cYzBSAGE9B3B6yfo1v8bWeU','2025-12-25 05:18:34.807761'),('eiikj5fylrx977vmoqrivmer1bgfviup','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcaWo:dzf_HMlrz0Q9pl8yx-omoNG5nvLbT6rcl3JWlS-ji7Y','2026-01-19 02:41:06.383285'),('emechkjk00v1hfcy8hi2v4kgi5t12ol3','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcbX4:kuFfeZYKsNFY54G1uC7aUPmSWnhYhKK8fGBiaTxUQ2c','2026-01-19 03:45:26.198093'),('eqhwm2syycqldhzet3zscr3kfwwyq6yt','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbfJ4:LOobgHB6dZ-jTFVymwZcuFdrjeWXrynz1IQUIaoZ828','2026-01-16 13:35:06.511047'),('erf8176oisgal3cfo7uenakpteuhucu8','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2fG:RxGuKp2gfYqo4nn4KoUejMsquHXDrddY9yJhrvm7g88','2026-01-17 14:31:34.418306'),('f18ww4mlzs6x6gdyqmp5zqbcjyts566b','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcIqx:-JqKM_IdPuNAyaDm3Jpd4yDRxk4e138fBNQ_VnQBxYY','2026-01-18 07:48:43.271828'),('f1eeg1ckxdyf1ztu1ogvyzq8pslfvi1p','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbvI4:wfGE2a04E9cZzXH2G1LZlK1Lpst4wD96wg2uKcb7CGc','2026-01-17 06:39:08.201857'),('f3aomy54zzj85spyqgj7o4od9p8igy72','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vT5yA:KEyHAECEtp_9JhthQLuqHeIl5YocJSEvIpJUSxMN8og','2025-12-23 22:14:06.117032'),('f45n8auvwe3b8u953v2vtfovehd8nxqc','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbqvL:jF2icO264XeztzZbh0iJdkFPd0cNPuBXwB5o6AnFO_0','2026-01-17 01:59:23.634118'),('f9sbhy1y0llgt744i7fjpc1cejoh94fw','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc1j0:pC_oQTffWwGPuBaCe7PEDPMr-R70mwpQZHW3jzywgbs','2026-01-17 13:31:22.565320'),('fbhqwhu9dl2gf0quv3q8axxs1y9xlxqe','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTcMi:QY73jccq4pTfS84PM1IecNRHrvvXVz6bySJXFMmu9mk','2025-12-25 08:49:36.174408'),('fcpu2bcu7ndy5f0l8ginmsfjnckvitii','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vaucY:oDYFVgkU5gx55a1lfpYqtTBJKDbNwpXqcC9SuZ1yiJE','2026-01-14 11:44:06.552155'),('fd7mzzscb0snwg7szygd97k5szz1i7k7','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vTHw6:25AcLQYh3QlT6rCJqnc04o25-ag1Wt26oySP8Jmm4XY','2025-12-24 11:00:46.245449'),('fg86lk5x5y8l8qwgpaosrv885fruurcb','.eJxVjMsOwiAQRf-FtSFACQ-X7v0GMswMUjWQlHZl_Hdt0oVu7znnvkSCba1pG7ykmcRZGC1Ov2MGfHDbCd2h3brE3tZlznJX5EGHvHbi5-Vw_w4qjPqteQJEp01gQ4QKdA7B-UAMPupYQLuYI5jMYYrBglXaKVu8z9YSFkTx_gAdkzib:1vUvP1:bdC8lgHlB3FxJvlO2hpdrQjL4KdOdHRvzTjMyxok6Oo','2025-12-28 23:21:23.825310'),('fildlwe7fctauzxxjcvq81wjkfto7ysd','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTdrD:hqn-SVC0ZeNlva1OZMA0c-Ctq2oPTXyFdbD4JRh6jGk','2025-12-25 10:25:11.098735'),('fj4rbmmm6z6p0bgr38f6dlvnm010hbdp','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcDP8:NVsadI00irYtSIvtccr5PkbIqzx023vJoHM_Ul9ID2o','2026-01-18 01:59:38.058507'),('fk2npko2oz1bya6jwtuyacdehwn4kfn5','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vc2Cd:sqDAlUNg0GEktPEZoLfY0SMtAQ8O_3fcT1J8Y_ZVjnc','2026-01-17 14:01:59.303832'),('fpc2p3jd42l997h1e4nvi2q3yhn8lsar','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbg5j:KxG5cqhQfwTnqYAeK9YIomcm3QhloyEpGz1_G0Ax6rw','2026-01-16 14:25:23.122745'),('frcg10b6k9zwh9ex6tlkuo2ls4ktycd5','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vaqv8:mzWMCgEQkCQlQe7_PQTMQlGscGDw2Gkw9P_VfuKCs2k','2026-01-14 07:47:02.312438'),('frdghbtfp7effyqkisljsjf1pcq8jit1','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcO6H:yAiPVC5tMbhKwxr4AwH4z__HRGnXGfJQMPIQNPHpdBA','2026-01-18 13:24:53.499733'),('fsfx767x1j86vf78vbzit12qy3egs1at','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vdmia:EpI-Hw6HaiKVxz0iwEru5eKlrxPOktIoZbpAU1oKhhM','2026-01-22 09:54:12.409688'),('fu0cr77mup0zftyomztkf6hpit8rqv7w','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vY0CU:bLb71lV8Db-7fyFY40zuoOcNQcd4iSY7TgPRswJ6vRg','2026-01-06 11:05:10.011120'),('fu7pty9fdpygiuuqrmrxjqqkphf1kegw','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSsII:eBW3K1qooxA8ICK0ocSm4SzrvzhUMHFaFuZrFsLOMdM','2025-12-23 07:37:58.359579'),('g0j35oty07z8b3ly02po9u0rq05xrh78','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfzt:9LUgmKSBaNgfxr_Q1J5uQDIJpiDtYmppSVmJ2q5sgY4','2026-01-16 14:19:21.973793'),('g65a1vpssp51ie7vr83ltqy3mdo2kr7e','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vceir:9On4lCMOfRWYnv79AUOqsySB38z0kZ1kP-Xe2Bn7y7k','2026-01-19 07:09:49.386278'),('g6v0nbih1po7xa31h3k2068ardukagfe','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vc2Cn:2sapdUXN5Wbvq6Wsz7jksGIB3beJZBjb-FVYwYQ6g2w','2026-01-17 14:02:09.672159'),('g9icop03577nolt01ki4sruzmdk3fy2f','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfns:sYv3RERZpyaQFqD_fJh5OM5Fp3PNNaVNneg7ZdmDzfo','2026-01-16 14:06:56.451012'),('gbbv6linhosym7mzyjgd9jb66vedgcaw','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcf2A:ZFmTMBu5xmWgbrx-lhIZo8Fm6_LHgy-DXp-uk3MxkZs','2026-01-19 07:29:46.207113'),('gbz11j9qphoc95u9hnm3daww28tbvmew','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vTSF1:BCD9MrixFn7uvYPsltKl60cX7Wm1r5uy3INgpcJDOzY','2025-12-24 22:00:59.201815'),('gdb6ty4jputur2rrheyfvjemr16c42fc','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcDJM:qBu56oc6wejZT-4Z9PxJvp3wARXhqJHtSa6e4Qt2YuQ','2026-01-18 01:53:40.485227'),('gdwbr0uihp1jcjw8f3xq9247wcy9ndxh','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vd0yU:K5Dn78qHvS9oX4uveJXY9sfEBeO3mMtjOwy-L9Eqo-Y','2026-01-20 06:55:26.256155'),('gr60kmbzp5u86sug1zeluc9i6fahsjev','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2Cy:N8jr9mzb2La43PA1d-lYSkzXCg8HMKmyNdaScpbUrmQ','2026-01-17 14:02:20.256850'),('gx25rmjjk9irzynegrm049rbwgddz52z','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWnbn:WfFeZ6HXaY3n2Vmxr--EK-pzAVFpyxgMCqLq1wozpXM','2026-01-03 03:26:19.946562'),('gz3ibw2rt9r6tl936qswhox17p56a9wa','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcdrJ:Cnwg-vr_8-f9u0jDaNgML3Yt7Sh-Wt4JoxGG4bVPG-Q','2026-01-19 06:14:29.724140'),('h4n3dwfm2338flnm0f1u2n6mcq9bx9xa','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vdmwY:CZnMpO9IUnrwlPT9XGr2xDRmPXz09v2c5e3QQBHdbxU','2026-01-22 10:08:38.523108'),('h6vs7m2p2jb73fxxg2evr30fi9saxvtq','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vamcF:HL2odHPJDkzvDJWa72faKZmfiEK-Or25pXWe5kFp8Ds','2026-01-14 03:11:15.227879'),('h9q5g1nsb0cxfqgonldc8dp9wqzmp28i','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vUMHX:HZrCkjEGdNJGPdnMeoTHA6TXfq80iZVwTeZRd3XoD4E','2025-12-27 09:51:19.953816'),('hc0csr4yobm7nikhgr5ii12wjovow5h3','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vaOOl:UmdaaX92oxjJD_BmgZ5KjH-0dWJiElRwJLzCH0uxgcU','2026-01-13 01:19:43.618732'),('hdun51v5lqwfyi7yyrz2zr8bp1toizfi','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTdgH:QJnPn5UGZNcTXHECG8veqcyzPDv0JbqcBiF21ppFpdk','2025-12-25 10:13:53.359228'),('hf0rlnfjl5zvrabc2o2ez32u6t9hfyeh','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSwuD:9nTGqGkyf3X5IoKq3-2HQlt5XBLWVtrzxfcDxj8UzU0','2025-12-23 12:33:25.134518'),('hgcgbzkuay33391v46w5r6em6mtydmr4','.eJxVjDsOwjAQBe_iGln4mw0lPWew1vYuDiBbipMKcXcSKQW0b2beWwRclxLWTnOYsrgIK06_W8T0pLqD_MB6bzK1usxTlLsiD9rlrWV6XQ_376BgL1sdPVHO6OCsB6_AIYGyOtkxGgUqOQ3MjvTIrFgbzzgY5RNYB3rzKInPF-LRN38:1vXfBZ:krTlhe7c_YXKgNrt0l5iEmGdAwZZozpfWl8cHbMfJoE','2026-01-05 12:38:49.115409'),('hh9gmxjs1wuzzad2hum31uztcbxmyj1o','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfnl:VybfG2SYf-1BfJg_kThuVBbL8U_xw1ZOSEBcw0XmkvE','2026-01-16 14:06:49.117539'),('hhcww3o5yrzpjkbawso2s7pkl9agrcuh','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vaoQY:p0JKWr59j-gvSvxmrH1gTc9qSwqV9SzNbg4_KapRYug','2026-01-14 05:07:18.463334'),('hmi4zpfpotul6ccvn5htn0pfx9scyc26','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcJAB:6FTjnMu7OA9DhbuZ4KHoL4exdFQwiGN6cuwnlKAbZ-M','2026-01-18 08:08:35.891687'),('i4m4j9vpnuv4dc9f79mw1zxxnqd2dbzr','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcgY0:riJJS78ZR7Y2TFYiw5uohOyKt3oiCuUAUcRcuXu7Ga8','2026-01-19 09:06:44.269582'),('i7iourg8jxiftpdhplduu16k07wsaz6u','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vdmx5:ofeHz4cOAYIgwRG_rQ-zJbRdWJYjIt8BuPhLFrE9Zf8','2026-01-22 10:09:11.419540'),('i9i61gxtsh16yyye1u7o83rc4bi155wx','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vbgBh:_ySBNi1icD-t4Qmo_w5nQV0kSrl30ftzVQRRMr3g5Jc','2026-01-16 14:31:33.317710'),('ia8ypyl670d7apwznhwo2dibrb5prq2q','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfgS:DG8R4EXDDYUckuTDQMVwis6ByzNqVMYp30paL4hzK6A','2026-01-16 13:59:16.790623'),('idy8ipjt6i5x87byznoiahcbvtt6fjv6','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbucM:a8_TmqTqQmVHxjmmgIqEQE1PxZT7KPI4Gw7d7U7rddI','2026-01-17 05:56:02.159214'),('ii81tjzf36wmy9vu0jm0eb4r06aavvhb','.eJxVjDsOgzAQRO_iOrIw_uGU6TmDtfbuxiQRljBUUe4ekCgSaap5b-YtImxriVujJU4orkIHcfktE-QnzQfBB8z3KnOd12VK8lDkSZscK9Lrdrp_BwVa2deAjiwnbUgNLlvlEAbmhB1nTQoxhN6AzqF3zGjJKN976vYoz-QViM8XO005BA:1vcHF7:NGvonqTbcF-_XwwGrCoAlytR-YVYRvMt7gyB5J3LQ_g','2026-01-18 06:05:33.235338'),('iogbkwhc43kjd4pw1qqpip62batx4hl4','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcHS4:mj8Vy8pteDcllYeNE0Vdyu8_ws8MdjysbsMSihBrcyA','2026-01-18 06:18:56.548084'),('ir8oms05n33fq7wcsvyyf2suzvyimt5b','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcfpC:PZmA8no7LgRieLleh7F5olRRFg-HJsvsA1oo8vz5Pec','2026-01-19 08:20:26.340426'),('iruiyfmg6uo581kuognj7rrb8uqhb0bs','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vTFGK:QZriqWZGgVFKvtWuvcm7XbtaObZlsBgDyufAysW4x5Q','2025-12-24 08:09:28.903141'),('iwy7b2dtspepo7uj5uz4qa22j5p5efmb','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcf21:osSDQLzzBLPVbA8owdweWdL4K3n91mMFByNbpbdWZeI','2026-01-19 07:29:37.761217'),('iwzeu752skm5uxfo95v8ibzoub88rqgm','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vbu9a:4VaUunyBm5q3DlsAExlhK81xHx9U8JYXeVoJeOgob4w','2026-01-17 05:26:18.425790'),('j182q12jy0ss85hkxgbgmzwehwakvws9','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vavI3:5cRtGyYD1INn1reCBpdLRxtoWpwjlv1CTR-gl78YwN8','2026-01-14 12:26:59.632457'),('j33x1ghwdrzkgpku9f5bw8dd9a1itg61','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vandx:-a--7m51SfV-AcwIp-306d8fPSVf0r_DH5ujHnkVBKA','2026-01-14 04:17:05.132928'),('j7s8b7w1moglo5qu4rcj30su7a1pok3q','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfwp:92j7f9220r6PlSqEfCf2LM-CjWiVPmIBkyNn9jf1oPM','2026-01-16 14:16:11.123718'),('j92w4lg6xdv2cagcibo0p3481h9e0pg8','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vcJA3:Hm8BpYoR0TSDoryRGASn6sFVmddUj_OZ420XCS69cq4','2026-01-18 08:08:27.030410'),('jckmkw2lzcn42s7fpw7ic7qxnhctoywm','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbf7H:JuyXzxRpbXXXDdWUKVb4Y3Ifz18GRzDNXI6OXIMnqNQ','2026-01-16 13:22:55.725125'),('jf4e6vxop4zjsnaw5m79bil85s6p52rk','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vTHvn:brOatA_nvt7BNswiCHL4CkhosZ0VbeEmjPPENhxBwgU','2025-12-24 11:00:27.426096'),('jowpeyp13j907gnusjxa4lny3u2fzpcd','.eJxVjMsOwiAQRf-FtSFQHtO6dO83kGEYpGogKe3K-O_apAvd3nPOfYmA21rC1nkJcxJnoa04_Y4R6cF1J-mO9dYktbouc5S7Ig_a5bUlfl4O9--gYC_f2pnIFL3zrEBl8jhMalCGAUgnPRqVR4gAySrvPVnOGjWxmZxFwEhavD__3jf5:1vTRtQ:mEPuHpJvjQoweosmd263cXiAzBIIKSpb4-5s15gzPY0','2025-12-24 21:38:40.725270'),('js5rzb8gxmp66s9yd34x3dwq7yl3zy73','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWoa8:siuZsa0i-KoxGWXjESWPi3TZ7YRGQOe-TzEIc3HbEAc','2026-01-03 04:28:40.740669'),('ju2cf4evxcxkkzyafuyravm8cmkfliev','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSsCg:ix-PGWndxoN9gMDJ7y_B0hOH1vEeH92p2kpci_YsAgM','2025-12-23 07:32:10.522818'),('judla3dekemikurct38n2bx7bp3u0h0f','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vavDI:JzPgezEkJukcOQP5U8ejRCJpaRaTKkB78jYTfOL9SGw','2026-01-14 12:22:04.379333'),('jwzlyxp2qdq091e9dhr9ga99eptxabca','.eJxVjDsOwyAQBe9CHSHAfFOm9xkQ612CkwgkY1dR7h5bcpG0b2bem8W0rSVunZY4I7syxS6_G6TpSfUA-Ej13vjU6rrMwA-Fn7TzsSG9bqf7d1BSL3strFGDk8EOFLQjIRE9WglKCE85BRC0G04jOQsKjR40ZC-DUsZClo59vriaNuk:1vSe6S:gjOtTBwneMX9d7qncND8Ud0nkSRDB5J3PL12Ms9WBzg','2025-12-22 16:28:48.606022'),('k88a3nxac2dwa4onsy5nk7zk13l9ib6g','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2Kq:I3zMLsQMJbqCxhHCtiRWsTyE-IhCIjaQJYohyqID0zI','2026-01-17 14:10:28.086587'),('kbv29rzsbvfeun4nu9lccn2j9x4pyjrt','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vUvPv:JG5_ih250EjC-gZ4qp1Pkfdw-wJqcxcXixwb_rOw2SU','2025-12-28 23:22:19.515978'),('kdoqu569ng32a8n7y5q95an90uqcuy81','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc1xm:rZtC1LjCVlhYHrfTu553Q9mkGoLAeKV3WY4gXfSEfUU','2026-01-17 13:46:38.318107'),('ker0lwv9ale003t0lnajy13rk41p04tc','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2Yg:07xZs1YEnPKXtbZpbCSGQSDfhSN0sG_IX9mJ0F4yx4Q','2026-01-17 14:24:46.624433'),('kf88rfjy8mupi1lyiq7ahclf2d7ifmc0','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vaUSE:5onOnQxKR8O6eClvmHtInnEHCj4dg_lvQ5kBDobyTIQ','2026-01-13 07:47:42.605647'),('kfvmgp7j0lauealnrl97boaczlcf8jr6','.eJxVjEsOwjAMBe-SNYrqVHFSluw5Q2TXMSmgROpnhbg7VOoCtm9m3ssk2taStiXPaRJzNmBOvxvT-Mh1B3Knemt2bHWdJ7a7Yg-62GuT_Lwc7t9BoaV86-h6FMAwoCq7oWMHgv2oAlEJRYAJMUP0oB4GIvbBO-1YNOQuQG_eH-IaOAA:1vLbU2:SNak3NJK8auN16odnm7bmpTbJjzlM4cEaRlg91WLIB0','2025-12-03 06:16:02.936153'),('kk1wimxiacmbzw4owv1sr95wyiejs8ng','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcIYC:lERA6nGwImDWD-3D6B_lEvM9fSa_QKjk10ell_50bZk','2026-01-18 07:29:20.034465'),('klp033r7mz6y0gbojk76a5rv3mxfwrxo','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTd0g:QBd46awDdQkND9eIZZXrp-OOoK2WYWTH6MRpA-cgtao','2025-12-25 09:30:54.490497'),('kmlbqtfe3x6s6sptul21qes2bryyzacl','.eJxVjDsOwyAQBe9CHSHAfFOm9xkQ612CkwgkY1dR7h5bcpG0b2bem8W0rSVunZY4I7syxS6_G6TpSfUA-Ej13vjU6rrMwA-Fn7TzsSG9bqf7d1BSL3strFGDk8EOFLQjIRE9WglKCE85BRC0G04jOQsKjR40ZC-DUsZClo59vriaNuk:1vSsAW:fA9fcSFOQ6UIiTgdXhiV45y1z7GLMD2RqlAT3SmGnow','2025-12-23 07:29:56.704331'),('ku6zmg23mkegbhmzh4p3dgu2blmly0d5','.eJxVjDsOwyAQBe9CHSHAfFOm9xkQ612CkwgkY1dR7h5bcpG0b2bem8W0rSVunZY4I7syxS6_G6TpSfUA-Ej13vjU6rrMwA-Fn7TzsSG9bqf7d1BSL3strFGDk8EOFLQjIRE9WglKCE85BRC0G04jOQsKjR40ZC-DUsZClo59vriaNuk:1vScIK:ZCaoZstaIeaT3f6bGyUwLFs4RYZL8-HqUSQxXV_xn-Y','2025-12-22 14:32:56.642574'),('kvfme16x61jblhwcfl7vvwkmu2kdd1j6','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcHLj:Xt_iIeGWZ8cIl-peGL3v9vVOQcmft64YWG_ANWRqsD0','2026-01-18 06:12:23.572662'),('l047n84ih2n9eej5ek7zxwsylq0xm904','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vUMAA:aX9UYuIT04i34dwFIpgiTLWzOJ61V4e3RSXsPNLslLc','2025-12-27 09:43:42.653836'),('l2duf738fvv75lm67m27d1gg31f2ydaq','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vamez:kAT_9pbNbBSKYrrKYAD0h6hK5eVMm3Dp7dgIQUW3p3w','2026-01-14 03:14:05.346509'),('l31ar2khva6wch2r9utgujtbo6oxyp68','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2dT:mybFUiHTlYNC5KfTjFTWE1bI__vU8ePuS3Of-bMRk7w','2026-01-17 14:29:43.709990'),('l7qbwjqjzjyvcfxb2qvjo3iz0k3lclie','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTcT4:xIPow0rt98YPcqOKxWYsxadaothJn25TpUtvxdRUt4s','2025-12-25 08:56:10.808997'),('lcvj4ntqtlnqy378vdt709qyx31fia2m','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vY0Co:ZiTeT_3942p1sOh7RigjEWYictAGjz_AXiQXj6u9Sb8','2026-01-06 11:05:30.230554'),('lgqo9ktvzt8vaoxik2uy191nalzbeq0b','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vT4yO:Ik2F8XTA26dM91a6x4rM-DWA-VKtr-j33K7WBjr6N3w','2025-12-23 21:10:16.988583'),('lh3f2tsfnq2f1t99ncnu5o9jvazpitec','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcJYb:wvGSAh96mbgCNAO4gGi1WiCO-g5uYMJiit2Eyh9q2Hk','2026-01-18 08:33:49.277060'),('llf0kgyi6zi0xq21z3z8p6b6zz8xbte3','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcfsm:pidG2LVqVbuU1HajuLPxxPaWPzIryIKOPCngal0BNZE','2026-01-19 08:24:08.645491'),('lmzvr34pxj16pld58hooh3bpjp8g83o3','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbfJw:YI5PD0Jv3PbdExCyFcRNUlnK3qAX4bIzo4EcaP4NMF0','2026-01-16 13:36:00.902005'),('lqp0u27mbs4bnze7frgtm7mi8hgileem','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTdow:14NElBWhBFPnkHiU14xwuz222-_-eojmlXihR1y5AkU','2025-12-25 10:22:50.230753'),('lsaqnfb3brs274gglpr5lau4guy36m45','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vXwmO:SI6rAnotbXDr1Hs6QFQ7SN9mNn_TGxDzy-Y3_7V7Dc0','2026-01-06 07:26:00.647696'),('m0p38u6qmsr28wp2z8la91r6fn37340p','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc1vT:peGiEn3ZdgROuPZKiIEEB0Q1Ay-wX0d-4SrjLXwCLl4','2026-01-17 13:44:15.888282'),('m1ic9vxd8io6zfyjjachizazhr96cfxy','.eJxVjEEOwiAQRe_C2pDCgAwu3fcMZGBAqoYmpV0Z765NutDtf-_9lwi0rTVsPS9hYnERSpx-t0jpkdsO-E7tNss0t3WZotwVedAux5nz83q4fweVev3WOhdUxgAiQ9YZMYLWAGCNs2dbhpIKG-tjIZdsUkjOMyut_GCAbSTx_gDJ8jd7:1vScDW:aHMlmCHBNYLnwURctoewWqKi5f_0CTB1k2IOO5YAlEk','2025-12-22 14:27:58.759334'),('m1kbbn9le4ypuu7s5kyvmc0qwunpqew5','.eJxVjMsOwiAQRf-FtSFACQ-X7v0GMswMUjWQlHZl_Hdt0oVu7znnvkSCba1pG7ykmcRZGC1Ov2MGfHDbCd2h3brE3tZlznJX5EGHvHbi5-Vw_w4qjPqteQJEp01gQ4QKdA7B-UAMPupYQLuYI5jMYYrBglXaKVu8z9YSFkTx_gAdkzib:1vTEC7:sVx8g20oDDGlEYey7ZgrEoW8AVKkk8P4_cgi4gREslE','2025-12-24 07:01:03.970676'),('m1kwgdybp0dvrpc58dacvgyk6gi81qw1','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1var9y:Y2LRDXZIf2MgkVWGOOYT-IcJcpAfOovDLoPSuuNJe9U','2026-01-14 08:02:22.945258'),('m2qeat5pfdd6bknrijgz8ih8k75zsgya','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbzeK:UYNlGRXyJdjmEg6SYk_VorPGjufUni5dRs_e-v8MWlQ','2026-01-17 11:18:24.819351'),('m67bd6pqre6ebrpcl6lccxulse70581f','.eJxVjMsOwiAQRf-FtSFACQ-X7v0GMswMUjWQlHZl_Hdt0oVu7znnvkSCba1pG7ykmcRZGC1Ov2MGfHDbCd2h3brE3tZlznJX5EGHvHbi5-Vw_w4qjPqteQJEp01gQ4QKdA7B-UAMPupYQLuYI5jMYYrBglXaKVu8z9YSFkTx_gAdkzib:1vXf8M:AWDR3Z2ruHVRkLj_-plTsZb8le8ILlOjHexzMlZfwdA','2026-01-05 12:35:30.430341'),('m9ykroavbd5gh12wixn0kjq8bdoyv2a7','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTdL5:-GqFWG2snj-IBl-SJg0ays8UbyPSSRgqbuyQ03TO5Gs','2025-12-25 09:51:59.140211'),('mckwa1vdeczt50icjiyjq1ekvjcjedll','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbg8y:dQRwFJPGA8oAdzCoofrfl01S4tGGpJV4o7vHnO8A30c','2026-01-16 14:28:44.689380'),('me6cgmhkpzmg1fihgrd2tmc9l74ou00o','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vTPoS:JeK15_Z-w7QLW6NtLZQ8ccS9NG6Gmq_hIl8oZAZko-0','2025-12-24 19:25:24.323850'),('mmaa1tunvmq0mfdauz29r9oswjf5q35x','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vXf7g:xD5i3dCvBDNpotHKnYsxuLbWrg4o3T6ZysryW3LCWQA','2026-01-05 12:34:48.880747'),('n17jqk4ni9zx6hc8z7q3f7ks7yfki87h','.eJxVjDsOwyAQBe9CHSHAfFOm9xkQ612CkwgkY1dR7h5bcpG0b2bem8W0rSVunZY4I7syxS6_G6TpSfUA-Ej13vjU6rrMwA-Fn7TzsSG9bqf7d1BSL3strFGDk8EOFLQjIRE9WglKCE85BRC0G04jOQsKjR40ZC-DUsZClo59vriaNuk:1vSrPH:OX3FvraDkOq5ukbNPAq6BdnU5a67ixsJJsnTH3Pfjog','2025-12-23 06:41:07.922356'),('n39dnn5y8di3za4kwj441woxdpqbb10e','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vapnp:ynmPmmD3E6U4COzVtqU-kQbqal0Bc88D58oJxXAc5Ag','2026-01-14 06:35:25.754872'),('n4tvbobzcor2ew9lqt9drs5ulwx230ql','.eJxVjMsOwiAQRf-FtSFACQ-X7v0GMswMUjWQlHZl_Hdt0oVu7znnvkSCba1pG7ykmcRZGC1Ov2MGfHDbCd2h3brE3tZlznJX5EGHvHbi5-Vw_w4qjPqteQJEp01gQ4QKdA7B-UAMPupYQLuYI5jMYYrBglXaKVu8z9YSFkTx_gAdkzib:1vTvIM:XMu0ptBx1aRIG1JLJFIoo271kxkxTfgcnZMtk9wBeD8','2025-12-26 05:02:22.974216'),('n61icl9xrllndpr8qq4g0gutd0b5knf9','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vTC9G:_s3SRSLPaXmG4NaRoATSqZhtSmCWnGecRRBzsDL08ZU','2025-12-24 04:49:58.723368'),('n8i51pok80fm9be7v4nrnxtlc465l54s','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTvJW:MuiUMosBQ2TGaB0VXjkReJrFP1FfaipFOY5yjGuNAag','2025-12-26 05:03:34.759443'),('n9ajhd0nbokmcuoakmccosqeb5vj5yly','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vaOtM:7eUaCZzjUHtPdW6XegyS2c0aWxNfzcMJSVHJZAQ0Pbk','2026-01-13 01:51:20.051856'),('ne8i8enpwsattw84h2h572ouaznb58fi','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTdij:SadIbMAkrtSGiV8kqRdxGUtUsG3YYNeoSgEbxBK3VFo','2025-12-25 10:16:25.337255'),('nfwyv35pjq7y1e80depraeuhmhxn2dey','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vaOm7:8aUsJIUVzEZXIMMZkm8rPfpJ41xGSLWm-M4cbs8koJg','2026-01-13 01:43:51.484482'),('nhscap78dsx3t2tacyet7atje5cjbop0','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTD88:ACPI86btn90PEijZrWb-Ty5USnb4CAPgWLj8IYELCWI','2025-12-24 05:52:52.400454'),('o1c891b9ji9getloxsjwgd5iot5zk9hr','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vTDFV:mVMoouaReMJLLK_oaIzf0msAKhmBBK6ccQg48-IPECI','2025-12-24 06:00:29.184050'),('o6epb6tee0uhkipk0v8dwq14ey1nhd5d','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbheC:sSsEQLoz1akqJ4y8iqv74ykEKfgJzxrWH-CvPE-rAA4','2026-01-16 16:05:04.017334'),('o6matbesngga6uquemrgum2i7aylcuwu','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vaUPG:hZMEWue_WA6c3MdlWs9m9eERk8cECQdVSqcpzOVmXGQ','2026-01-13 07:44:38.044701'),('o923q9np9xmtxd4uwywj8xrgea5507nl','.eJxVjDsOwjAQBe_iGln4mw0lPWew1vYuDiBbipMKcXcSKQW0b2beWwRclxLWTnOYsrgIK06_W8T0pLqD_MB6bzK1usxTlLsiD9rlrWV6XQ_376BgL1sdPVHO6OCsB6_AIYGyOtkxGgUqOQ3MjvTIrFgbzzgY5RNYB3rzKInPF-LRN38:1vXf8n:JyiSULo9yKVODgiMKIVMe3mkWm5FfMDuI4M0semCSNA','2026-01-05 12:35:57.089617'),('obhgrwlxvb4uklum5s1205b2eivs3thg','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWoOL:T8naYpq4VCr4Fsh1I5AmaJzqAMrOwer3s9s5qoFv_Eg','2026-01-03 04:16:29.571839'),('oc9l47arstc0rx2m8j35oooxctoadwl3','.eJxVjDsOwyAQBe9CHSHAfFOm9xkQ612CkwgkY1dR7h5bcpG0b2bem8W0rSVunZY4I7syxS6_G6TpSfUA-Ej13vjU6rrMwA-Fn7TzsSG9bqf7d1BSL3strFGDk8EOFLQjIRE9WglKCE85BRC0G04jOQsKjR40ZC-DUsZClo59vriaNuk:1vSpTb:WxMQQ2zdcDMpXM5Wr72MMMFfA-K16eWN0XSrd1lr2oM','2025-12-23 04:37:27.534137'),('ofts57x3msyseyubf32w4a9qnd8n18yx','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTD5i:_GbsVK0JYXmWRGc6IugzcZHjiEqk-TY8rVjj6FghxuY','2025-12-24 05:50:22.752694'),('oj7wyrhji4org7olc1eg73d6h24y94ow','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbvNW:fHwM7FGfb_wZZjGmDW1xzvCGhrlhLt5muB66wgOSiao','2026-01-17 06:44:46.190848'),('om26x13ryonxat4u3yzilfs7of3a0kqd','.eJxVjMsOwiAQRf-FtSFACQ-X7v0GMswMUjWQlHZl_Hdt0oVu7znnvkSCba1pG7ykmcRZGC1Ov2MGfHDbCd2h3brE3tZlznJX5EGHvHbi5-Vw_w4qjPqteQJEp01gQ4QKdA7B-UAMPupYQLuYI5jMYYrBglXaKVu8z9YSFkTx_gAdkzib:1vXf9A:8vuqRKXvjbT5ITzI-nesMoNA40QCaST37436SUwg9v8','2026-01-05 12:36:20.633178'),('onecjkzsgqd1ltubbf141qpx1xrbkpus','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcbeP:sOD99s3WstmlupP3qOXdqN6Y_sitwaQ-leszVnPNsX0','2026-01-19 03:53:01.550006'),('ooehlckt2tp8tji3l7twwvphkqeo873x','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vUvPH:dfnhWYQqrEDITUGln9c-xPkcNXWv9J5sVNexTR-rzzM','2025-12-28 23:21:39.642500'),('op29urfyfc598oqzlchm1te6m71qy0fy','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbg2n:_UJWj8amP71jy0y3Ow4tXMVRLHApppYCntC0GXAgJxI','2026-01-16 14:22:21.246176'),('osntxmedsa4ms7bs997z00l14kph898v','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWoTE:Tk9ClTt5cNZ_D9VxZmNT14eoL2P4bMdETny_C5znmRE','2026-01-03 04:21:32.233278'),('oviuj3zy3s96dzpi1fmeywcjb0sofq3x','.eJxVjDsOwjAQBe_iGln4mw0lPWew1vYuDiBbipMKcXcSKQW0b2beWwRclxLWTnOYsrgIK06_W8T0pLqD_MB6bzK1usxTlLsiD9rlrWV6XQ_376BgL1sdPVHO6OCsB6_AIYGyOtkxGgUqOQ3MjvTIrFgbzzgY5RNYB3rzKInPF-LRN38:1vY02z:SVeobsoyAVo4701t6fmJ1iMlL0p_HR7_grmlMLg9yC0','2026-01-06 10:55:21.155196'),('owuavdnds4mbaxljway4lx3s9316g507','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSy0Q:8Ir_EYF0W8wiwNnpvJGFJ4uvtrWboKWBOh_lOW4Hvfw','2025-12-23 13:43:54.307143'),('p2w7c99z3sy3pxtlofss3wl1oj1o37gs','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWoDb:pocUvdKra9XrpcrgjPAZyv0gZTpZKvbYqJPPKIiVy5Y','2026-01-03 04:05:23.688444'),('p4vsba3wrqcil2fs3ulq12bmncyceiln','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTZ5Z:KuUBb_4cVRwL4k3y1_mCbqfDRzJZqwE7ZjBHmu3qPJg','2025-12-25 05:19:41.073013'),('p96ffb7s8ptwag9bysc8ikd4a8numu7r','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcGXC:iINK7gIdBaF2UnmO0VTT7Iu2Fmh22ddllsbHDFo1Q-g','2026-01-18 05:20:10.266197'),('pazq9buarbv6qc9p4so33l2lmv1d5nk8','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcbxw:9NdLWi_dAJHkaslgwVzCE3A83BGp1GNWhTYpU-ZOeGc','2026-01-19 04:13:12.315598'),('peaevvlmf83re743lid2cpt974c3g8y2','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcNWQ:WSphG_KK-LaTNEE-VvTpwI8iSb5AUnFQEQ2RQbi_6CU','2026-01-18 12:47:50.361475'),('pf1tdgt4ufcuct8d8mkypeg4zr7fpszh','.eJxVjMsOwiAQRf-FtSFACQ-X7v0GMswMUjWQlHZl_Hdt0oVu7znnvkSCba1pG7ykmcRZGC1Ov2MGfHDbCd2h3brE3tZlznJX5EGHvHbi5-Vw_w4qjPqteQJEp01gQ4QKdA7B-UAMPupYQLuYI5jMYYrBglXaKVu8z9YSFkTx_gAdkzib:1vUMIR:C8Jl2oQLeHT7ShHdcBs9YuDvaAeb-BQgOPx6zhvwGv4','2025-12-27 09:52:15.356133'),('pfdrjn408bz01pkzvg6909ogn3zo4wwk','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vbg5u:3Q3kwCi-0j3RFJv0xA_1FM1AXZvmlB_lylU80ZAuLVE','2026-01-16 14:25:34.592144'),('pqp1ha6yuui0ov3i8o6oxqabwdz3fhpy','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWo36:IvIoB-ydSVyM8E56EM5c74E3d7EomS1jGQMwruRHbZU','2026-01-03 03:54:32.281408'),('pqwkf5d0x9krgs62wrjqx45pguffm7bl','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTbnq:S80o901mONDAspGhZ4tonZHbEx502Dr-PdspRgJtjDU','2025-12-25 08:13:34.016938'),('pw5qhyjryljq3gs4igw33wcbw8ubllc3','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vTD7k:MOezU--CtJy-JIuFKKvxwHQocim9zokbtPF-elCqtno','2025-12-24 05:52:28.086625'),('q0fw2iedt2nlbm34fqcm11pb2hj8w67g','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vTPfR:6aKAaHFi_jUlFO2fwzSHccvMNcMb_AhK6FXRSMVnJCM','2025-12-24 19:16:05.420199'),('q3p9i1ranxjubwj06yg07r3ndq8gx2r4','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbvNM:h_k43sIsx4K_9rYnmD11y-7xxGwqUMjEIzWwBG108yM','2026-01-17 06:44:36.458141'),('q89wjr67zqfkol5yb9yed358vqgxqly0','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vbu9M:FHHT90wD7UmGKFRM_iIHzAX8Rs8EdAlp7aNvEo4_c1Q','2026-01-17 05:26:04.234699'),('qbbzw8zjp35jj2ddrw1ljfde0usuyy29','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfvb:XqL-y-YmqfM1AdTJ9A-OxWlAS5kTX5n7ptRG07LROTU','2026-01-16 14:14:55.519154'),('qffcpwtoelzdtkm6c3ehnoqn6o9j5qyd','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vaPkC:l3FNFFWayXamg6VMEopubNj_cnSZYpTJo6Bburl-0CA','2026-01-13 02:45:56.265254'),('qlmt23tpmdcvc40oms0dgq4lueixx0lv','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vavRu:PpB6rpsSDmGhYg60FghZwTKpUM_ekzmSCKwv6_iQYCY','2026-01-14 12:37:10.578355'),('qpg7s0dsf5vjiue2sh4oakgsc1f6kxo0','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcQei:b0Mbefo8dAXLWP9UXo-QTaM_UliqhtIx3wMEJD9W1oo','2026-01-18 16:08:36.453460'),('qqupvrcwzyggx37h59tp8t3vieqlpaqw','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vSs9i:7hzfY4KGVAVsq93atVUzTIsqDx_M0XwzOGAXi0XesPI','2025-12-23 07:29:06.117078'),('qqylyp3y9ledg985pust8chudliiexd8','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vTHsw:B5NB1Zma6dCr3bQCAsANYAqHUd0WE_dBmTGK1fSF040','2025-12-24 10:57:30.112402'),('qvoc05ho36qnyj6k5axy0vo706xyul0o','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2CT:xCDLmEGLoFtM55A4nmx75B-PsPe5G0jZdpkc68W8v2g','2026-01-17 14:01:49.064329'),('qz4lbl7uqyqz06psydtq8r2ikwmymi65','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWoKT:WE6cR6rb9Anntd9o08zfWcTOrtJJnMriXaLTLBU5rho','2026-01-03 04:12:29.467528'),('r401abiykejda5n51tgt7vppst67riy2','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vaokn:Gx3RTnnmJj8gkCoqs2Dk-zSjv14PoMAgNcvt-Fs7-v0','2026-01-14 05:28:13.524741'),('r4qmcsvycrpvila5k10ddm56gcyp7z8z','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vX0eJ:NGlGYXHIlELwt7w1sZ4eNsZ2xnEyFWtU80hyG4OUtos','2026-01-03 17:21:47.456147'),('r5cvmnmiark2shphqjphdpm6q4xh4a1i','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vc1jX:OnxY77PbeJ01P8l2BnaOo9jDwkdG8UR_Zt5FKOuqGII','2026-01-17 13:31:55.584823'),('r5kauguas9i6zuybwn579wogfrpa88oa','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vauTk:rwnLtnrdqeayleo0NJw79C002LGz9emP35nRehxMVMk','2026-01-14 11:35:00.204909'),('rcpzto531uenrmk4nugmgygdfka3eo8u','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWoRF:K79n5PtPFPfnqMWExl3eKh2qJ39YfnxFF8-xq24LEz4','2026-01-03 04:19:29.866303'),('rdz6csyn10j313z2thkh7g13sighawp8','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWoQx:XK71BWhc_vHpRsuoJ2fdWYrCuuInLO3oAhJVzJjLPF4','2026-01-03 04:19:11.848736'),('rfxj82txb6js2e3izsior5395my1v2u0','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vaOtW:iIM7Y1JMZn-xR2M4cQyUhOTvpy0wgJRw8m1HBEROF_I','2026-01-13 01:51:30.893646'),('rgphoj97d4av205wgvbmvslrtqygs7q5','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcbe3:z3spj6f0PaXCObyD8KKlKkkBCwtXYhjJEs6FqrUojGY','2026-01-19 03:52:39.999994'),('ri0bi2ptpvzkgzkgxm074ikhz1ec45je','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfsn:yZ5X__jc4XcC7wOOCeFah-JWs43Cz7fApp1hcVMQLbs','2026-01-16 14:12:01.605133'),('ro4htb46lo2lanu2eeujzq8k9sbo6qel','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbg9o:FzhEi9hJhyuJsULsYtG9hMiGN5BhHXLFGDlMabL-zNE','2026-01-16 14:29:36.695819'),('rrffio0ekjcc3ns3zt7prxne3l377573','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcgDr:r1A8U0u0sGbCgTN4MYxAO9UDUbybZPDG_aV7jATAcOg','2026-01-19 08:45:55.429166'),('rxwec5dbk0s7r2ulvxthja6z3uxsj01i','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcHQ5:Twzf0rtRJh4ftuUExZrgJxIi1aKZ_e0NyVzAWSUR24Q','2026-01-18 06:16:53.056898'),('rz7h4nsruzcfrzde7gauekkpmxb6w0c2','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcbl3:RG8eU9jJHWHAsezKSO9cZwnS6m0Tajm0Toiqp9hDusA','2026-01-19 03:59:53.411745'),('s0oaitjyz21gmsuck1dk0guafppvqigv','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc1vZ:_XFB4gk5wxq834WfPAd2OALwmoN9f_pRnh_9WFagQHQ','2026-01-17 13:44:21.714844'),('s7buor64chyyar2i3i2tk66n0o638efx','.eJxVjDsOwjAQBe_iGln4mw0lPWew1vYuDiBbipMKcXcSKQW0b2beWwRclxLWTnOYsrgIK06_W8T0pLqD_MB6bzK1usxTlLsiD9rlrWV6XQ_376BgL1sdPVHO6OCsB6_AIYGyOtkxGgUqOQ3MjvTIrFgbzzgY5RNYB3rzKInPF-LRN38:1vXf7o:AywAVzXGRGCEG6xlBltHU9uyYIo0BrGErzMu41tHEsc','2026-01-05 12:34:56.997275'),('s93qcie76hr9nel707aojtwqe7nllgu3','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc1wI:edk8cUu6sjTyzbdtdHNIakn7riLTon7rv9H4Nrx3jbg','2026-01-17 13:45:06.387861'),('sb15o3qptvzazlt7xz9juo1qz3udnt0h','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcDhM:ZlwYmWr6BG8_xQv6MwbKhGv4mh9rGd5VkyTpwtJKi9k','2026-01-18 02:18:28.825417'),('sb5wut3511k7xxo3pf0vtdxs0lvwol94','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSvjp:snrbj6FBvbFyf4ZKtJbx3Mku1iUmgFiG0SIH0_Lg7HQ','2025-12-23 11:18:37.039072'),('scpn0bhpa0myx0s8d37ns6diz5ql2qzs','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vXfG7:g4S9FnyUCiL8iWSmgtgPDWt3Xr-bxLZkrJXse6YUwL4','2026-01-05 12:43:31.400501'),('se89vm366nudwlouoeizoyhkcg3krnqg','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vamKI:VQBcc0mwx8FRqc6q3LMd8AXJfSIShe3LOd5_WpTdBvw','2026-01-14 02:52:42.416591'),('sk978zuyq8iq2ayln8307q3f9bpwc88r','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcEBg:eZOvzHfZH6UKy0IfKrzoPKg2FgvRjiEALLWG2blH_BI','2026-01-18 02:49:48.989217'),('slhytoaoed7yllwf8fju024rzu1s5zbe','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcJVb:h61oRjyIoVAPbttq7p_mXn74NVEZrhYitIimOmBGZRo','2026-01-18 08:30:43.274097'),('sts5d7hx1af6wd91dprpiodzcww6zbls','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbf9o:z50jhpBEkxZDf_rKQhA0NTKH6-3nGddAanlSlaJAdHA','2026-01-16 13:25:32.435852'),('swm65vjaro887igskb8flpd9vl7bwq1q','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWtQq:u2L98qCnvKWByf9S7HZa7Y7Qxyk7t96W5j68BD4URE4','2026-01-03 09:39:24.799402'),('sz67egyomxsbt4wrmu5n3korsa9ifod1','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTCTy:B7nDbuQ2Y2-0xH6qCzLAHpSjwXteuDHqFRZFSuiGzYs','2025-12-24 05:11:22.674915'),('t1y8qgh5ifaub5kp7yd9ugpg4w1fyqsi','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vTPhJ:Xu5J4zNir0xEkfCzwbjhIJKND26BRrTuWmABss8X5H8','2025-12-24 19:18:01.014153'),('t7o45rfono1bb76xrxa20jcy1ai3jacn','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTXZ9:LYnBTE1OfDYMffIXNpTjPDNtQ7iFq5JyVxHkr7BQ_y8','2025-12-25 03:42:07.955397'),('te5yiv6ncc97vk7nbwzsy8m68qbn4eb2','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vcJ4O:rRE3DucvQSABQLoAEne54TbxSU0RXLY_fY-iEcRSdqc','2026-01-18 08:02:36.128546'),('teu0sv9tfyq9ej10tc08j6kwagduvq0r','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbhMb:801zEq7LzCKG6IMRVbIHqbGQzM78W2N3J3RzOxaTJqU','2026-01-16 15:46:53.159251'),('tl8fq3dk5ygy8op3prbwmj99i3dgl7m7','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSwwl:gKSLrNK5Eamwxv8ko9VwtOG2Rw30-VVY3iA1FVSGL5M','2025-12-23 12:36:03.238142'),('tn3z1gr7b4g3x6141b4hwu1lcnyrb2wp','.eJxVjEEOwiAQRe_C2pDCgAwu3fcMZGBAqoYmpV0Z765NutDtf-_9lwi0rTVsPS9hYnERSpx-t0jpkdsO-E7tNss0t3WZotwVedAux5nz83q4fweVev3WOhdUxgAiQ9YZMYLWAGCNs2dbhpIKG-tjIZdsUkjOMyut_GCAbSTx_gDJ8jd7:1vRQOy:ZPOJnAXWGroq_B3-esOS2wvIcX1S9jN9Y7mFRE1wTfY','2025-12-19 07:38:52.811995'),('tpws83lflhf3cvx29nmovj9qkegsbh17','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vaq7A:SyTPGgj3PPbUxCVSAVbZ5pdwPpjUAeHstZIvICmjsB8','2026-01-14 06:55:24.869697'),('treuua7u84te41uw9cbft6ljjzhy1hnj','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfjF:fHBMk_hEg1PvfI2HW7-yzae8MQJd5DpGliqq7rVXqfQ','2026-01-16 14:02:09.804241'),('tsu6x7i9qg5iw0woml9n41o3ua3pltvt','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vcQAv:Os6HRA92A6bnsPwpZQ18Gl8aO3njYbHek3YKeJv-9Us','2026-01-18 15:37:49.221998'),('tt6ebvhkfaibpkkfuzv4pykiy98z85xv','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSxWm:fVEYPgqpiq7Q4eIBJ0rEpGrwn40oKLiniBoPnI_NJe8','2025-12-23 13:13:16.147277'),('tvrv59e61359da2tidfldj6u4yrar7b2','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbenj:qBewEmw9-FU_myaLiCB_ZI3o8ltKO65LyO9E2k76wPA','2026-01-16 13:02:43.558098'),('uc1xvmb3uoyqjwluhkxrqsw53tilhngc','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbew3:R_nfSTJ8ZKZur7mW12wdUyOSBiwZUXJ9Ae60aZ2-W1E','2026-01-16 13:11:19.200761'),('ufvkg6k7a9nb6nxr3jl0o8c33jtrdql9','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbg6Z:g62rF9mlVJrOIOAOBEYn-KabzMc_oUTdbribZnKn_cA','2026-01-16 14:26:15.138604'),('ug4itv106cseaghbccnd2nk1viy1gkhn','.eJxVjMsOwiAQRf-FtSFQHtO6dO83kGEYpGogKe3K-O_apAvd3nPOfYmA21rC1nkJcxJnoa04_Y4R6cF1J-mO9dYktbouc5S7Ig_a5bUlfl4O9--gYC_f2pnIFL3zrEBl8jhMalCGAUgnPRqVR4gAySrvPVnOGjWxmZxFwEhavD__3jf5:1vTD63:dx9dXgHbojiHPol7SFzQ-jMBs78Q8PEMxKs0057wgSY','2025-12-24 05:50:43.920039'),('ukh7rmia31kv9drr0ivwoym2bbll4qlg','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcgHe:xGaXGPu3_5INa-zc1-m_yi04B8IU9DBGVdrKZuZZyQg','2026-01-19 08:49:50.276004'),('unauanwiog799c0mhaa279wq3zj97rit','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcISg:QVBlfBCcm8vi1lBpfc1oaK0SaH2RpJGpGxAnv6lJSaE','2026-01-18 07:23:38.507891'),('upt01hs43nfxadrzfxo8eyomqtisyyoz','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vaqpY:B6RVflFwF4Qteh7HYYmByCJBC8VsKhedrqjB19avIOU','2026-01-14 07:41:16.071237'),('ursxcmobgljqn7ogpzuhbc3n3iv7gk6q','.eJxVjDsOwyAQBe9CHSHAfFOm9xkQ612CkwgkY1dR7h5bcpG0b2bem8W0rSVunZY4I7syxS6_G6TpSfUA-Ej13vjU6rrMwA-Fn7TzsSG9bqf7d1BSL3strFGDk8EOFLQjIRE9WglKCE85BRC0G04jOQsKjR40ZC-DUsZClo59vriaNuk:1vSdlX:SL8Q6oFXi_ClKj46IUeWN0Um4-OokuIKl-xXenRWNcc','2025-12-22 16:07:11.705001'),('uvnd9uwmdhsvvx3m2qdghj2lmza4akp9','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vTXYu:NrOfVHhR6csVBNIrKX6CTw57YYRpMBWOIw0GkraJSvQ','2025-12-25 03:41:52.778715'),('v3gwx12wu0q9iam4sbspzyf68mf7gu6k','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vaopa:_RLFEYXn3SHux4h6JqZYMKjN3aLcM8RSEXdXezCXOl0','2026-01-14 05:33:10.209583'),('v88zj95z9v1r71n1zeyzlooyjf4tro89','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vceuK:KHBXQGT8miy3Wcd28j9lQnYXEZQqJGzKb5zuvyfzkZE','2026-01-19 07:21:40.036274'),('vaa41wgkiyo4scncbrd8x3bnvttzknia','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcQQd:s9ykxeIHBUNLhul3plAYrNy0rYzd1Lun98B0y_R5MZA','2026-01-18 15:54:03.793057'),('vbsfszr4c4ohh3wz1s1gdbpaq9mptrl4','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcd55:dsRnYqZycjU4kFVnW01_9rxn8LOgiLQyVLveES2WBT8','2026-01-19 05:24:39.352749'),('ve9ku8y8wcpk3x32w4zbupzrtjpbmsxj','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vaOpT:AJ8RIXHokHo8WfR2813iEnKrgc26T19ewrbKsmqyoYk','2026-01-13 01:47:19.033570'),('vgw53933f2vz0e16qhbkgrq9bgslvqyl','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbgBn:HO5AOlG63WtsunZVBfxD5rPZWx9vOd-Naw-Jd5Gyl4s','2026-01-16 14:31:39.147065'),('vj1ufepmj9muhbnnxzfx8mya7yy21rvv','.eJxVjDsOwyAQBe9CHSHAfFOm9xkQ612CkwgkY1dR7h5bcpG0b2bem8W0rSVunZY4I7syxS6_G6TpSfUA-Ej13vjU6rrMwA-Fn7TzsSG9bqf7d1BSL3strFGDk8EOFLQjIRE9WglKCE85BRC0G04jOQsKjR40ZC-DUsZClo59vriaNuk:1vSeKj:-FrfbOvc9HvHYebWQ-_MRQvbRIXVcBKvenV65p27lD0','2025-12-22 16:43:33.411373'),('vjyy0yteg9rthj9e4qhad5b2gpj7vmr4','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc4nj:Ox26AWjFOr1O35iMRJJcax1dcxQDV0L3TReOboRwzbo','2026-01-17 16:48:27.129549'),('vu8e8idud9tfde83a4uvu20h27c7868f','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vaP5L:Jbb71q9zMajjuegq1yjDXGSLMi3g_mBdnO58rocvRsU','2026-01-13 02:03:43.124342'),('vwahpfvx4ep5xiorc7tjp93r7fp8s5r3','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vT54e:dpZJ4G7DK2IG17d43si5g49urdw2HMagiVRlK2LH-Ss','2025-12-23 21:16:44.896611'),('w4ciz30lz2b4gteup7kaal7dez954fk7','.eJxVjEsOwjAMBe-SNYrqVHFSluw5Q2TXMSmgROpnhbg7VOoCtm9m3ssk2taStiXPaRJzNmBOvxvT-Mh1B3Knemt2bHWdJ7a7Yg-62GuT_Lwc7t9BoaV86-h6FMAwoCq7oWMHgv2oAlEJRYAJMUP0oB4GIvbBO-1YNOQuQG_eH-IaOAA:1vLIuo:IRqIZ_k_5eQiWhTZbdnHjys-mC8eNPJuvtI1lkKhOZg','2025-12-02 10:26:26.184480'),('w4dfqs9zmikfn30e5b49nmciv6m48j9t','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vamOR:Qey_xylucbbE_O3tYxKaw8zdqhqk5-atedjrZ7lr6-Q','2026-01-14 02:56:59.682411'),('w5dt8scpvxq1y9x44xo86pzpqs6y63au','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vaumo:7JmTmtGKvCikU4hmskJGmkvceMfO8b3dkWQjMYgX2bQ','2026-01-14 11:54:42.988213'),('waqatkmf67mszsmo9vlzc5ew6q46ot98','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcIUm:pjJt_pDP2c7Dt9diIq-oCops_zskLDyfH7K743cwS1I','2026-01-18 07:25:48.490385'),('wb636c8x110oqgmjzsk2u73y5av2iqaj','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTdp4:tz0naOOpP4rmpiu9PAFx919np3nwJZh3v6oGenWx0hU','2025-12-25 10:22:58.623745'),('wbcot7ch971uxvxjsyo5o3rqudafdr2q','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vTXYn:xqha-r219QNKFoJYrWB7q9aYQNyMqz1lLKx5md05DaU','2025-12-25 03:41:45.873518'),('wbnbcvztx1idzjzd83kdz4ubo2c4ss0u','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcQjk:2Wqqa05y7a7C6aYeSCf2Xq1flITFot9pSGGMW_eQK0M','2026-01-18 16:13:48.217322'),('wdkg4td1htm86inblpxmgmqxg9iwyi5p','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbftt:TixS7NjVS3oS9hBiQVenBx3fJQply_yt8bYVultorw8','2026-01-16 14:13:09.004901'),('wgtrkdeqnc9ve1h20oboqrqhx0t5ar06','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vcJYh:lL3Wg3HUnAHepDQueva30nJfcUJ-kF-20X-AAgzi3TA','2026-01-18 08:33:55.120519'),('wgv4effvukoxvf9zebvmilzoa347uabt','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vapt1:fo87TwNMpA6V52dbAWySHr1GXLlPtpR1EOep325XWQA','2026-01-14 06:40:47.239992'),('whxyz2bnv1z02qezhlsachqga45r71xr','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc37o:ZF_z0RfHo7n5JXPIuiX0eMOHJVPkJ3MsVbvsHlo_H9s','2026-01-17 15:01:04.150711'),('wicx6rotlv6krz2ee4z1navjzjk0dbn3','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vTcca:fwvdwG6WixZKjlGtQOwshRf9QBg1R_IDOHFd6m4PzYo','2025-12-25 09:06:00.344460'),('wifbgopu08s0dtx9sgq7iouhuibliu4y','.eJxVjDsOwjAQBe_iGlmx17-lpOcMlte7wgGUSHFSIe4OkVJA-2bmvVQu29ry1mXJI6uzMkGdfkcq9SHTTvheptus6zyty0h6V_RBu77OLM_L4f4dtNLbtwYAYeRoglC04jBY9EABIwDTkFz16CuSSbYmR4kkDdYxeBvEJST1_gDsiTc4:1vTPfi:C1g2eqDvd9yYXX9HqlBQBSTJw7cymIGixeBPniX8WDs','2025-12-24 19:16:22.572457'),('wn3h3d2s9j9omgk601867pbg5n99rbv0','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vcJYp:bO2nGi9k_rIZw0gxSqXhDq4ktswz3IWvwpwFvOvo274','2026-01-18 08:34:03.051121'),('wrkwpgqzc17jbngzm6m243032fh0chjw','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vcewz:SN5l4kSOyg0YCEx_M3Mny3rCndkwwydZnKG6M1qoaYc','2026-01-19 07:24:25.335958'),('wu50g9xz4z7m02hshgudijj89d5wc2a5','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vcHBy:P5n86HustFkKSMXtThgoXf1LIVCHq1zeyc_a9YQk_h4','2026-01-18 06:02:18.487313'),('ww1vfpzporo2oadhco080vcoi133ifqo','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfL5:I0plp_JbJm81U2yrKbjP9CbZnZFeBs2Nancr_si1ZHs','2026-01-16 13:37:11.592707'),('ww3lumoyyrmavp40owehw8c8vtx6mrtn','.eJxVjDsOwyAQBe9CHSHAfFOm9xkQ612CkwgkY1dR7h5bcpG0b2bem8W0rSVunZY4I7syxS6_G6TpSfUA-Ej13vjU6rrMwA-Fn7TzsSG9bqf7d1BSL3strFGDk8EOFLQjIRE9WglKCE85BRC0G04jOQsKjR40ZC-DUsZClo59vriaNuk:1vSeDE:IozQ7k5cYjN9zQzeCg69dQbnWLOsNFxBdD2zoAOQ1_8','2025-12-22 16:35:48.807640'),('wzcievwx9fc561vcicyl0q8flomxkijd','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWmW7:JCNZ7BKgJJyYcpvhKlvuhZvyP0DstozYGCZnp0lhoOw','2026-01-03 02:16:23.887487'),('x0fmzdk3mlwyirfkr629up2yf4yhxrlz','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vaPfH:BkBDzZaH-_vzPl0cfaF677VoT0W_G9fhLFQosipXxf0','2026-01-13 02:40:51.834139'),('x3ksitxko2pfirb7z32uxvoqbw8fjalv','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfKX:V5KRExVxIAt8-gsuK7zKLXYmQJwEmt2PS88n_nQI7bQ','2026-01-16 13:36:37.768855'),('x3pcf83c7liwlc696ekj18cs2nwvgmr2','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vaPm4:l2dDcpKWjWtW4CgrpnYYTWkqwLI4SoFPQYwaGJlMXQg','2026-01-13 02:47:52.268142'),('x7zzx9jualjc5h2hes9kh7ycz080qmeo','.eJxVjDsOwjAQBe_iGllLcFibkj5niPbjxQGUSHFSIe4OkVJA-2bmvVxP61L6tea5H9RdXAB3-B2Z5JHHjeidxtvkZRqXeWC_KX6n1XeT5ud1d_8OCtXyrUUCtBYzNJqJo2o6QjTJJpiYKGBKyRQFARVie8YGGg6BlfGUzMy9PzR1OQ4:1vceFK:LkHWpuWUHzhsD7HpZ5Bdpe9hcZcYgnjGHTR1df4ToLQ','2026-01-19 06:39:18.327542'),('xbr33qg71lz3no0bcbhfle0uykszjl1y','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vaqqP:_71--OUCy9LZ6Ij99zVQlb1-UGLg7vy-nmUzAOU2PYg','2026-01-14 07:42:09.867880'),('xbwz15eoa4d2tde50fzxyht9h3ysbjb3','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vcftX:50gE-VoBU_BdBp9BbXj_AZc3cyLEQOLWWarv6zT9lCc','2026-01-19 08:24:55.263613'),('xi8wbal34i8gezarcsul7rkni3vrnem0','.eJxVjDsOwyAQBe9CHSHAfFOm9xkQ612CkwgkY1dR7h5bcpG0b2bem8W0rSVunZY4I7syxS6_G6TpSfUA-Ej13vjU6rrMwA-Fn7TzsSG9bqf7d1BSL3strFGDk8EOFLQjIRE9WglKCE85BRC0G04jOQsKjR40ZC-DUsZClo59vriaNuk:1vSrzX:PAaXxQxaYNmiIiHT0nrS4QXVwfOSYfLlw1jzg_zA8iA','2025-12-23 07:18:35.686513'),('xks0w2iquiuwcjr3h6v6vzymdxnjl4sj','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vaP52:QjD5PhAVRIXwubt3IM9TMrkGCoEj_uC6324GKnQKtUY','2026-01-13 02:03:24.289025'),('xlro54sb1lpor1upd5qreh4x0s0f961u','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWoAo:4zcxiSeo8XXTan-q7U4GYmkwZxXWOhqCfJ_9NeAyJH0','2026-01-03 04:02:30.870767'),('xp1lus5jn3cqrnt68jpo49cvjcfd0wk6','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWoZs:kXTYBH73oZeefFi0B0j70UkZU1u53Hq-1Ie6P6qURbc','2026-01-03 04:28:24.319271'),('y2cjvrh89rjhzpkchf04l728u6dqqcfw','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vY07l:FZdJu_FZghrde70PUMR32dmexGo1iKr8gxy9b5e_RqQ','2026-01-06 11:00:17.895877'),('y30i7f7uk7i2ao9729l2k2c6cjkrh2nd','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vXf7y:H4Mz26JmSXv9KdodarR41YX9FY2cnLCAq6-8nqPC0hg','2026-01-05 12:35:06.757733'),('y6g18j4dkr0xld2i7umyecc33z8u2xf8','.eJxVjEsOwjAMBe-SNYpwksYxS_Y9Q2U7KS2gVOpnhbg7VOoCtm9m3st0vK1Dty1l7sZsLiaY0-8mrI9Sd5DvXG-T1amu8yh2V-xBF9tOuTyvh_t3MPAyfOsoqSgmIYeFwaPkTNo7AE8pQaDI2QcBTOQJI2ITXARQof7caxPYvD_XYjc0:1vbfrG:tTcnrOMkFlvTmT3XqLzsAF6m-d9Li6qvOukJ0DM9ows','2026-01-16 14:10:26.730284'),('yev7arkulxm4g37kvzanl9ixmod3nk8l','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vSwJ4:9SFHcTmw3ZxD0G6X-_ee5hDE1OqStjv6ys5Aw5wy0yw','2025-12-23 11:55:02.897862'),('ymhsven505njg05to4spr9eqd4psj1bp','.eJxVjEsOwiAUAO_C2hDgmRZcuvcM5P0qVUOT0q6Md9eaLnQ7M5mnybguJa9N5zyKORnvzeEXEvJd62bkhvU6WZ7qMo9kt8TuttnLJPo47-3foGAr368bEvTgOEmnoEf0SBwBgkoIKB_du-AFIZIqa4pDJIddisrkkprXGwl2OLM:1vWoUp:9yoE8muDuL2irL_jhToodqia-iyv_ktF-eotr2d_tiw','2026-01-03 04:23:11.357730'),('yod5qcje6wtjiy457utjnic6wyu0f1sw','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2CO:d-EmDdAjlSBCUoXIeaGP4vwBmGqT1_RlQxuH7eioW-8','2026-01-17 14:01:44.175448'),('z4x9ra4cyrztxraaj6l4985grrvt330g','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vT6c3:qG-LHsaSWiSEBfoKNLnnH0cxtuexwH-0OeI7W0mzJOY','2025-12-23 22:55:19.110760'),('z8ucx6lgasclr3ic6y95h520sxowrla5','.eJxVjM0OwiAQhN-FsyFQfrbx6N1nILssSNVAUtqT8d2VpAed43zfzEsE3LcS9p7WsLA4CyNOvx1hfKQ6AN-x3pqMrW7rQnIo8qBdXhun5-Vw_w4K9jLWlGcAD0qnrEhrYxiY7awm1pldBMeJLGb6xns0AHFy4DICIlky4v0B_WY45Q:1vSvjW:aoSJNEOT61e6C8a8ciTgeKHcRHVf7LnIHXfNZK8qtM0','2025-12-23 11:18:18.678121'),('zbp1vp9yg1wav9knnywzx1274osepr7h','.eJxVjEsOwjAMBe-SNYqM0zgpS_Y9Q2UnDimgVupnhbg7VOoCtm9m3sv0vK213xad-yGbi0Fz-t2E00PHHeQ7j7fJpmlc50HsrtiDLrabsj6vh_t3UHmp3_rsVBx6IQcYInkW8EpAEqgNUCJEpoDogVuNiV2DgUpEaJpcVFI27w-xgjcQ:1vSvs3:ejsSWabBbozDGdRRjHuH8ARQ_Ne-fCog_wKSjUn_cX0','2025-12-23 11:27:07.573043'),('zflrp684y7nh2k3co0c3mlx3q052y351','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vbf7Q:rsCZmrlqmhoRdwhZG0N_IzCMwSKL916LLt-rTiS0MdM','2026-01-16 13:23:04.245790'),('zgogrmwfitth0ihrrotzjququyajsw9f','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vce3k:kPVzl6fYxpK6ogDqLr9LtPeetGzYQJyHXELeOkXQ7_s','2026-01-19 06:27:20.320929'),('zjlluatelci7ky417f17e780mpke1t5f','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vfXJu:S6K9sIB2WA6OspcrTbWU9BxyP8RLd-XP9PmRcLjPOUQ','2026-01-27 05:51:58.236975'),('zpb6t23lsucn4n15c01lt582eqynjm84','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc4on:1i_GKQWYdcR2FfWw7_tAYjwYY9iOnpOPl0XWdfS4NaA','2026-01-17 16:49:33.520825'),('zqoamjgyf2fqo4dqubh1dh4wzf9bquo8','.eJxVjDsOwjAQBe_iGlneGMcbSnrOYHk_4ABypDipEHeHSCmgfTPzXibldSlpbTqnUczJdMEcfkfK_NC6EbnnepssT3WZR7KbYnfa7GUSfZ539--g5Fa-dfBOUCIAEqkXCajo_NVFJOmlh46RHAE7UOCBow_uqHHIxOo5iJj3BwtFOIo:1vc2Uk:nOF_3tDegJkHpjYidFk3UkoBtltsHvfQECGE9Q_yH_I','2026-01-17 14:20:42.582678'),('zyqrtnfgrbnfe2i7nhp0a7hprsrmlczf','.eJxVjEsOwjAMBe-SNYrqVHFSluw5Q2TXMSmgROpnhbg7VOoCtm9m3ssk2taStiXPaRJzNmBOvxvT-Mh1B3Knemt2bHWdJ7a7Yg-62GuT_Lwc7t9BoaV86-h6FMAwoCq7oWMHgv2oAlEJRYAJMUP0oB4GIvbBO-1YNOQuQG_eH-IaOAA:1vLk8c:ns953sPb5nvQO0LEcWgUem0CeUeXQM2CIy2rj88jja8','2025-12-03 15:30:30.130756');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_site`
--

DROP TABLE IF EXISTS `django_site`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_site` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_site_domain_a2e37b91_uniq` (`domain`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_site`
--

LOCK TABLES `django_site` WRITE;
/*!40000 ALTER TABLE `django_site` DISABLE KEYS */;
INSERT INTO `django_site` VALUES (1,'example.com','example.com');
/*!40000 ALTER TABLE `django_site` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialaccount_socialaccount`
--

DROP TABLE IF EXISTS `socialaccount_socialaccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `socialaccount_socialaccount` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider` varchar(200) NOT NULL,
  `uid` varchar(191) NOT NULL,
  `last_login` datetime(6) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `extra_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`extra_data`)),
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `socialaccount_socialaccount_provider_uid_fc810c6e_uniq` (`provider`,`uid`),
  KEY `socialaccount_socialaccount_user_id_8146e70c_fk_core_user_id` (`user_id`),
  CONSTRAINT `socialaccount_socialaccount_user_id_8146e70c_fk_core_user_id` FOREIGN KEY (`user_id`) REFERENCES `core_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialaccount_socialaccount`
--

LOCK TABLES `socialaccount_socialaccount` WRITE;
/*!40000 ALTER TABLE `socialaccount_socialaccount` DISABLE KEYS */;
/*!40000 ALTER TABLE `socialaccount_socialaccount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialaccount_socialapp`
--

DROP TABLE IF EXISTS `socialaccount_socialapp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `socialaccount_socialapp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider` varchar(30) NOT NULL,
  `name` varchar(40) NOT NULL,
  `client_id` varchar(191) NOT NULL,
  `secret` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `provider_id` varchar(200) NOT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`settings`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialaccount_socialapp`
--

LOCK TABLES `socialaccount_socialapp` WRITE;
/*!40000 ALTER TABLE `socialaccount_socialapp` DISABLE KEYS */;
/*!40000 ALTER TABLE `socialaccount_socialapp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialaccount_socialapp_sites`
--

DROP TABLE IF EXISTS `socialaccount_socialapp_sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `socialaccount_socialapp_sites` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `socialapp_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `socialaccount_socialapp_sites_socialapp_id_site_id_71a9a768_uniq` (`socialapp_id`,`site_id`),
  KEY `socialaccount_socialapp_sites_site_id_2579dee5_fk_django_site_id` (`site_id`),
  CONSTRAINT `socialaccount_social_socialapp_id_97fb6e7d_fk_socialacc` FOREIGN KEY (`socialapp_id`) REFERENCES `socialaccount_socialapp` (`id`),
  CONSTRAINT `socialaccount_socialapp_sites_site_id_2579dee5_fk_django_site_id` FOREIGN KEY (`site_id`) REFERENCES `django_site` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialaccount_socialapp_sites`
--

LOCK TABLES `socialaccount_socialapp_sites` WRITE;
/*!40000 ALTER TABLE `socialaccount_socialapp_sites` DISABLE KEYS */;
/*!40000 ALTER TABLE `socialaccount_socialapp_sites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialaccount_socialtoken`
--

DROP TABLE IF EXISTS `socialaccount_socialtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `socialaccount_socialtoken` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` longtext NOT NULL,
  `token_secret` longtext NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `account_id` int(11) NOT NULL,
  `app_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `socialaccount_socialtoken_app_id_account_id_fca4e0ac_uniq` (`app_id`,`account_id`),
  KEY `socialaccount_social_account_id_951f210e_fk_socialacc` (`account_id`),
  CONSTRAINT `socialaccount_social_account_id_951f210e_fk_socialacc` FOREIGN KEY (`account_id`) REFERENCES `socialaccount_socialaccount` (`id`),
  CONSTRAINT `socialaccount_social_app_id_636a42d7_fk_socialacc` FOREIGN KEY (`app_id`) REFERENCES `socialaccount_socialapp` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialaccount_socialtoken`
--

LOCK TABLES `socialaccount_socialtoken` WRITE;
/*!40000 ALTER TABLE `socialaccount_socialtoken` DISABLE KEYS */;
/*!40000 ALTER TABLE `socialaccount_socialtoken` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-13  9:26:34
