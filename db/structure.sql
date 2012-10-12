CREATE TABLE `ActuationService` (
  `serviceId` varchar(36) NOT NULL,
  PRIMARY KEY (`serviceId`),
  KEY `FKBA3E97C35313096` (`serviceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `ComputationService` (
  `serviceId` varchar(36) NOT NULL,
  PRIMARY KEY (`serviceId`),
  KEY `FK6EA5530E5313096` (`serviceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `ConsumesInformationArtifact` (
  `resourceId` varchar(36) NOT NULL,
  `serviceId` varchar(36) NOT NULL,
  KEY `FK8BB31587E02F698` (`resourceId`),
  KEY `FK8BB3158740B8158D` (`serviceId`),
  KEY `FK8BB315875313096` (`serviceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `Conversation` (
  `resourceId` varchar(36) NOT NULL,
  PRIMARY KEY (`resourceId`),
  KEY `FK35E930A3E02F698` (`resourceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `Event` (
  `eventId` varchar(36) NOT NULL,
  `version` int(11) NOT NULL,
  `dateTime` datetime NOT NULL,
  `hazard` char(1) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`eventId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `EventPlace` (
  `eventId` varchar(36) NOT NULL,
  `placeId` varchar(36) NOT NULL,
  KEY `FKB0A6E2AD5CADA8FA` (`placeId`),
  KEY `FKB0A6E2AD2780C360` (`eventId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `EventResource` (
  `eventId` varchar(36) NOT NULL,
  `resourceId` varchar(36) NOT NULL,
  KEY `FKA98490A851044486` (`resourceId`),
  KEY `FKA98490A82780C360` (`eventId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `EventService` (
  `eventId` varchar(36) NOT NULL,
  `serviceId` varchar(36) NOT NULL,
  KEY `FKB631FEDB2780C360` (`eventId`),
  KEY `FKB631FEDB5313096` (`serviceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `IdTableName` (
  `id` varchar(36) NOT NULL,
  `version` int(11) NOT NULL,
  `tableName` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `Image` (
  `resourceId` varchar(36) NOT NULL,
  `uniformResourceLocator` varchar(255) NOT NULL,
  PRIMARY KEY (`resourceId`),
  KEY `FK437B93BE02F698` (`resourceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `InformationArtifact` (
  `resourceId` varchar(36) NOT NULL,
  `type` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`resourceId`),
  KEY `FK8724BAFE51044486` (`resourceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `MeasurementService` (
  `serviceId` varchar(36) NOT NULL,
  PRIMARY KEY (`serviceId`),
  KEY `FKA9CDD3795313096` (`serviceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `MeasurementValuePair` (
  `resourceId` varchar(36) NOT NULL,
  `unitId` varchar(36) NOT NULL,
  `value` double NOT NULL,
  PRIMARY KEY (`resourceId`),
  KEY `FK4B9433AF667EA972` (`unitId`),
  KEY `FK4B9433AFE02F698` (`resourceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `Message` (
  `resourceId` varchar(36) NOT NULL,
  `conversationResourceId` varchar(36) NOT NULL,
  `fromResourceId` varchar(255) NOT NULL,
  `payload` varchar(255) NOT NULL,
  `toResourceId` varchar(255) NOT NULL,
  PRIMARY KEY (`resourceId`),
  KEY `FK9C2397E7EC10B23E` (`conversationResourceId`),
  KEY `FK9C2397E7E02F698` (`resourceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `Person` (
  `resourceId` varchar(36) NOT NULL,
  PRIMARY KEY (`resourceId`),
  KEY `FK8E48877551044486` (`resourceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `Place` (
  `placeId` varchar(36) NOT NULL,
  `version` int(11) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`placeId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `Point` (
  `placeId` varchar(36) NOT NULL,
  PRIMARY KEY (`placeId`),
  KEY `FK49B65705CADA8FA` (`placeId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `ProducesInformationArtifact` (
  `resourceId` varchar(36) NOT NULL,
  `serviceId` varchar(36) NOT NULL,
  KEY `FKF93C8C6BE02F698` (`resourceId`),
  KEY `FKF93C8C6B40B8158D` (`serviceId`),
  KEY `FKF93C8C6B5313096` (`serviceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `ResourcePlace` (
  `resourcePlaceId` varchar(255) NOT NULL,
  `version` int(11) NOT NULL,
  `dateTime` datetime NOT NULL,
  `placeId` varchar(36) NOT NULL,
  `resourceId` varchar(36) NOT NULL,
  PRIMARY KEY (`resourcePlaceId`),
  KEY `FK692BAD7951044486` (`resourceId`),
  KEY `FK692BAD795CADA8FA` (`placeId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `Service` (
  `serviceId` varchar(36) NOT NULL,
  `version` int(11) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`serviceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `ServiceResource` (
  `resourceId` varchar(36) NOT NULL,
  `serviceId` varchar(36) NOT NULL,
  KEY `FKF99921C351044486` (`resourceId`),
  KEY `FKF99921C35313096` (`serviceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `SpatialThing` (
  `placeId` varchar(36) NOT NULL,
  `altitude` double NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `type` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`placeId`),
  KEY `FKC530CE6A5CAF2583` (`placeId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `Thing` (
  `resourceId` varchar(36) NOT NULL,
  PRIMARY KEY (`resourceId`),
  KEY `FK4D094CE51044486` (`resourceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `Unit` (
  `unitId` varchar(36) NOT NULL,
  `version` int(11) NOT NULL,
  `abbreviation` varchar(255) DEFAULT NULL,
  `conversionMultiplier` double DEFAULT NULL,
  `conversionOffset` double DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `symbol` varchar(255) DEFAULT NULL,
  `typePrefix` varchar(255) NOT NULL,
  `uneceCommonCode` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`unitId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `resource` (
  `resourceId` varchar(36) NOT NULL,
  `version` int(11) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`resourceId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `schema_migrations` (
  `version` varchar(255) NOT NULL,
  UNIQUE KEY `unique_schema_migrations` (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

