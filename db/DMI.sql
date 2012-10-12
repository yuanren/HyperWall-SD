
    alter table ActuationService 
        drop 
        foreign key FKBA3E97C35313096;

    alter table ComputationService 
        drop 
        foreign key FK6EA5530E5313096;

    alter table ConsumesInformationArtifact 
        drop 
        foreign key FK8BB31587E02F698;

    alter table ConsumesInformationArtifact 
        drop 
        foreign key FK8BB3158740B8158D;

    alter table ConsumesInformationArtifact 
        drop 
        foreign key FK8BB315875313096;

    alter table Conversation 
        drop 
        foreign key FK35E930A3E02F698;

    alter table EventPlace 
        drop 
        foreign key FKB0A6E2AD5CADA8FA;

    alter table EventPlace 
        drop 
        foreign key FKB0A6E2AD2780C360;

    alter table EventResource 
        drop 
        foreign key FKA98490A851044486;

    alter table EventResource 
        drop 
        foreign key FKA98490A82780C360;

    alter table EventService 
        drop 
        foreign key FKB631FEDB2780C360;

    alter table EventService 
        drop 
        foreign key FKB631FEDB5313096;

    alter table Image 
        drop 
        foreign key FK437B93BE02F698;

    alter table InformationArtifact 
        drop 
        foreign key FK8724BAFE51044486;

    alter table MeasurementService 
        drop 
        foreign key FKA9CDD3795313096;

    alter table MeasurementValuePair 
        drop 
        foreign key FK4B9433AF667EA972;

    alter table MeasurementValuePair 
        drop 
        foreign key FK4B9433AFE02F698;

    alter table Message 
        drop 
        foreign key FK9C2397E7EC10B23E;

    alter table Message 
        drop 
        foreign key FK9C2397E7E02F698;

    alter table Person 
        drop 
        foreign key FK8E48877551044486;

    alter table Point 
        drop 
        foreign key FK49B65705CADA8FA;

    alter table ProducesInformationArtifact 
        drop 
        foreign key FKF93C8C6BE02F698;

    alter table ProducesInformationArtifact 
        drop 
        foreign key FKF93C8C6B40B8158D;

    alter table ProducesInformationArtifact 
        drop 
        foreign key FKF93C8C6B5313096;

    alter table ResourcePlace 
        drop 
        foreign key FK692BAD7951044486;

    alter table ResourcePlace 
        drop 
        foreign key FK692BAD795CADA8FA;

    alter table ServiceResource 
        drop 
        foreign key FKF99921C351044486;

    alter table ServiceResource 
        drop 
        foreign key FKF99921C35313096;

    alter table SpatialThing 
        drop 
        foreign key FKC530CE6A5CAF2583;

    alter table Thing 
        drop 
        foreign key FK4D094CE51044486;

    drop table if exists ActuationService;

    drop table if exists ComputationService;

    drop table if exists ConsumesInformationArtifact;

    drop table if exists Conversation;

    drop table if exists Event;

    drop table if exists EventPlace;

    drop table if exists EventResource;

    drop table if exists EventService;

    drop table if exists IdTableName;

    drop table if exists Image;

    drop table if exists InformationArtifact;

    drop table if exists MeasurementService;

    drop table if exists MeasurementValuePair;

    drop table if exists Message;

    drop table if exists Person;

    drop table if exists Place;

    drop table if exists Point;

    drop table if exists ProducesInformationArtifact;

    drop table if exists Resource;

    drop table if exists ResourcePlace;

    drop table if exists Service;

    drop table if exists ServiceResource;

    drop table if exists SpatialThing;

    drop table if exists Thing;

    drop table if exists Unit;

    create table ActuationService (
        serviceId varchar(36) not null,
        primary key (serviceId)
    );

    create table ComputationService (
        serviceId varchar(36) not null,
        primary key (serviceId)
    );

    create table ConsumesInformationArtifact (
        resourceId varchar(36) not null,
        serviceId varchar(36) not null
    );

    create table Conversation (
        resourceId varchar(36) not null,
        primary key (resourceId)
    );

    create table Event (
        eventId varchar(36) not null,
        version integer not null,
        dateTime datetime not null,
        hazard char,
        label varchar(255),
        primary key (eventId)
    );

    create table EventPlace (
        eventId varchar(36) not null,
        placeId varchar(36) not null
    );

    create table EventResource (
        eventId varchar(36) not null,
        resourceId varchar(36) not null
    );

    create table EventService (
        eventId varchar(36) not null,
        serviceId varchar(36) not null
    );

    create table IdTableName (
        id varchar(36) not null,
        version integer not null,
        tableName varchar(255) not null,
        primary key (id)
    );

    create table Image (
        resourceId varchar(36) not null,
        uniformResourceLocator varchar(255) not null,
        primary key (resourceId)
    );

    create table InformationArtifact (
        resourceId varchar(36) not null,
        primary key (resourceId)
    );

    create table MeasurementService (
        serviceId varchar(36) not null,
        primary key (serviceId)
    );

    create table MeasurementValuePair (
        resourceId varchar(36) not null,
        unitId varchar(36) not null,
        value double precision not null,
        primary key (resourceId)
    );

    create table Message (
        resourceId varchar(36) not null,
        conversationResourceId varchar(36) not null,
        fromResourceId varchar(255) not null,
        payload varchar(255) not null,
        toResourceId varchar(255) not null,
        primary key (resourceId)
    );

    create table Person (
        resourceId varchar(36) not null,
        primary key (resourceId)
    );

    create table Place (
        placeId varchar(36) not null,
        version integer not null,
        label varchar(255),
        primary key (placeId)
    );

    create table Point (
        placeId varchar(36) not null,
        primary key (placeId)
    );

    create table ProducesInformationArtifact (
        resourceId varchar(36) not null,
        serviceId varchar(36) not null
    );

    create table Resource (
        resourceId varchar(36) not null,
        version integer not null,
        label varchar(255),
        primary key (resourceId)
    );

    create table ResourcePlace (
        resourcePlaceId varchar(255) not null,
        version integer not null,
        dateTime datetime not null,
        placeId varchar(36) not null,
        resourceId varchar(36) not null,
        primary key (resourcePlaceId)
    );

    create table Service (
        serviceId varchar(36) not null,
        version integer not null,
        label varchar(255),
        primary key (serviceId)
    );

    create table ServiceResource (
        resourceId varchar(36) not null,
        serviceId varchar(36) not null
    );

    create table SpatialThing (
        placeId varchar(36) not null,
        altitude double precision not null,
        latitude double precision not null,
        longitude double precision not null,
        primary key (placeId)
    );

    create table Thing (
        resourceId varchar(36) not null,
        primary key (resourceId)
    );

    create table Unit (
        unitId varchar(36) not null,
        version integer not null,
        abbreviation varchar(255),
        conversionMultiplier double precision,
        conversionOffset double precision,
        description varchar(255),
        symbol varchar(255),
        typePrefix varchar(255) not null,
        uneceCommonCode varchar(255),
        primary key (unitId)
    );

    alter table ActuationService 
        add index FKBA3E97C35313096 (serviceId), 
        add constraint FKBA3E97C35313096 
        foreign key (serviceId) 
        references Service (serviceId);

    alter table ComputationService 
        add index FK6EA5530E5313096 (serviceId), 
        add constraint FK6EA5530E5313096 
        foreign key (serviceId) 
        references Service (serviceId);

    alter table ConsumesInformationArtifact 
        add index FK8BB31587E02F698 (resourceId), 
        add constraint FK8BB31587E02F698 
        foreign key (resourceId) 
        references InformationArtifact (resourceId);

    alter table ConsumesInformationArtifact 
        add index FK8BB3158740B8158D (serviceId), 
        add constraint FK8BB3158740B8158D 
        foreign key (serviceId) 
        references ComputationService (serviceId);

    alter table ConsumesInformationArtifact 
        add index FK8BB315875313096 (serviceId), 
        add constraint FK8BB315875313096 
        foreign key (serviceId) 
        references Service (serviceId);

    alter table Conversation 
        add index FK35E930A3E02F698 (resourceId), 
        add constraint FK35E930A3E02F698 
        foreign key (resourceId) 
        references InformationArtifact (resourceId);

    alter table EventPlace 
        add index FKB0A6E2AD5CADA8FA (placeId), 
        add constraint FKB0A6E2AD5CADA8FA 
        foreign key (placeId) 
        references Place (placeId);

    alter table EventPlace 
        add index FKB0A6E2AD2780C360 (eventId), 
        add constraint FKB0A6E2AD2780C360 
        foreign key (eventId) 
        references Event (eventId);

    alter table EventResource 
        add index FKA98490A851044486 (resourceId), 
        add constraint FKA98490A851044486 
        foreign key (resourceId) 
        references Resource (resourceId);

    alter table EventResource 
        add index FKA98490A82780C360 (eventId), 
        add constraint FKA98490A82780C360 
        foreign key (eventId) 
        references Event (eventId);

    alter table EventService 
        add index FKB631FEDB2780C360 (eventId), 
        add constraint FKB631FEDB2780C360 
        foreign key (eventId) 
        references Event (eventId);

    alter table EventService 
        add index FKB631FEDB5313096 (serviceId), 
        add constraint FKB631FEDB5313096 
        foreign key (serviceId) 
        references Service (serviceId);

    alter table Image 
        add index FK437B93BE02F698 (resourceId), 
        add constraint FK437B93BE02F698 
        foreign key (resourceId) 
        references InformationArtifact (resourceId);

    alter table InformationArtifact 
        add index FK8724BAFE51044486 (resourceId), 
        add constraint FK8724BAFE51044486 
        foreign key (resourceId) 
        references Resource (resourceId);

    alter table MeasurementService 
        add index FKA9CDD3795313096 (serviceId), 
        add constraint FKA9CDD3795313096 
        foreign key (serviceId) 
        references Service (serviceId);

    alter table MeasurementValuePair 
        add index FK4B9433AF667EA972 (unitId), 
        add constraint FK4B9433AF667EA972 
        foreign key (unitId) 
        references Unit (unitId);

    alter table MeasurementValuePair 
        add index FK4B9433AFE02F698 (resourceId), 
        add constraint FK4B9433AFE02F698 
        foreign key (resourceId) 
        references InformationArtifact (resourceId);

    alter table Message 
        add index FK9C2397E7EC10B23E (conversationResourceId), 
        add constraint FK9C2397E7EC10B23E 
        foreign key (conversationResourceId) 
        references Conversation (resourceId);

    alter table Message 
        add index FK9C2397E7E02F698 (resourceId), 
        add constraint FK9C2397E7E02F698 
        foreign key (resourceId) 
        references InformationArtifact (resourceId);

    alter table Person 
        add index FK8E48877551044486 (resourceId), 
        add constraint FK8E48877551044486 
        foreign key (resourceId) 
        references Resource (resourceId);

    alter table Point 
        add index FK49B65705CADA8FA (placeId), 
        add constraint FK49B65705CADA8FA 
        foreign key (placeId) 
        references Place (placeId);

    alter table ProducesInformationArtifact 
        add index FKF93C8C6BE02F698 (resourceId), 
        add constraint FKF93C8C6BE02F698 
        foreign key (resourceId) 
        references InformationArtifact (resourceId);

    alter table ProducesInformationArtifact 
        add index FKF93C8C6B40B8158D (serviceId), 
        add constraint FKF93C8C6B40B8158D 
        foreign key (serviceId) 
        references ComputationService (serviceId);

    alter table ProducesInformationArtifact 
        add index FKF93C8C6B5313096 (serviceId), 
        add constraint FKF93C8C6B5313096 
        foreign key (serviceId) 
        references Service (serviceId);

    alter table ResourcePlace 
        add index FK692BAD7951044486 (resourceId), 
        add constraint FK692BAD7951044486 
        foreign key (resourceId) 
        references Resource (resourceId);

    alter table ResourcePlace 
        add index FK692BAD795CADA8FA (placeId), 
        add constraint FK692BAD795CADA8FA 
        foreign key (placeId) 
        references Place (placeId);

    alter table ServiceResource 
        add index FKF99921C351044486 (resourceId), 
        add constraint FKF99921C351044486 
        foreign key (resourceId) 
        references Resource (resourceId);

    alter table ServiceResource 
        add index FKF99921C35313096 (serviceId), 
        add constraint FKF99921C35313096 
        foreign key (serviceId) 
        references Service (serviceId);

    alter table SpatialThing 
        add index FKC530CE6A5CAF2583 (placeId), 
        add constraint FKC530CE6A5CAF2583 
        foreign key (placeId) 
        references Point (placeId);

    alter table Thing 
        add index FK4D094CE51044486 (resourceId), 
        add constraint FK4D094CE51044486 
        foreign key (resourceId) 
        references Resource (resourceId);
