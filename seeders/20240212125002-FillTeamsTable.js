
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Teams', [
      {
        title: 'Interpretación',
        body: 'El equipo de Interpretación es el corazón de nuestro servicio. Conformado por intérpretes altamente capacitados y multilingües, este equipo se dedica a proporcionar servicios de interpretación de calidad en eventos multilingües. Nuestro objetivo es facilitar la comunicación efectiva entre participantes de diferentes idiomas y culturas, garantizando precisión y profesionalismo en cada interpretación. Si tienes una pasión por los idiomas y disfrutas de la interacción intercultural, ¡este es tu equipo!',
        attachmentId: null,
        authorId: null,
        tokens: 0,
        numUsers: 0,
        adminTeamId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Administración',
        body: 'El equipo de Administración es el pilar que sostiene las operaciones diarias de nuestra empresa. Este equipo maneja las tareas administrativas generales, incluyendo la gestión de la oficina, el apoyo al personal y la administración de recursos. Su enfoque está en mantener un entorno de trabajo eficiente y productivo, facilitando todas las necesidades operativas. Si eres una persona con habilidades organizativas y administrativas, y disfrutas ayudando a mantener las cosas en orden, ¡considera unirte a nuestro equipo de Administración!',
        attachmentId: null,
        authorId: null,
        tokens: 0,
        numUsers: 0,
        adminTeamId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Investigación y Desarrollo (I+D)',
        body: 'El equipo de Investigación y Desarrollo (I+D) es el motor de la innovación en nuestra empresa. Dedicado a la exploración de nuevas tecnologías y métodos, este equipo trabaja para mejorar continuamente nuestros servicios de interpretación. Desde el desarrollo de nuevas herramientas hasta la implementación de tecnologías avanzadas, el equipo de I+D garantiza que siempre estemos a la vanguardia de la industria. Si eres una persona innovadora, con un interés en la tecnología y el desarrollo, ¡únete a nuestro equipo de I+D y sé parte del futuro de la interpretación!',
        attachmentId: null,
        authorId: null,
        tokens: 0,
        numUsers: 0,
        adminTeamId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Marketing',
        body: 'El equipo de Marketing se dedica a promover nuestros servicios de interpretación y a fortalecer nuestra presencia en el mercado. A través de estrategias innovadoras de comunicación y marketing, este equipo trabaja para atraer nuevos clientes, fidelizar a los existentes y posicionar nuestra marca como líder en la industria. Si eres creativo, tienes habilidades en marketing digital y te apasiona el crecimiento de marcas, el equipo de Marketing es el lugar perfecto para ti.',
        attachmentId: null,
        authorId: null,
        tokens: 0,
        numUsers: 0,
        adminTeamId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Coordinación',
        body: 'El equipo de Coordinación es responsable de la organización y gestión logística de todos nuestros eventos de interpretación. Desde la programación de intérpretes hasta la gestión de horarios y recursos, este equipo asegura que cada evento se desarrolle sin contratiempos y con la máxima eficiencia. Si eres una persona organizada, con habilidades para la gestión y disfrutas trabajando en un entorno dinámico, únete a nuestro equipo de Coordinación y ayuda a crear experiencias impecables.',
        attachmentId: null,
        authorId: null,
        tokens: 0,
        numUsers: 0,
        adminTeamId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Documentación y Gestión',
        body: 'El equipo de Documentación y Gestión combina la administración de documentos con la gestión operativa del servicio. Encargado de la creación y mantenimiento de registros precisos, políticas y procedimientos, este equipo garantiza que todas las operaciones se realicen de manera organizada y conforme a las normativas establecidas. Además, se ocupa de la gestión financiera y del personal, asegurando una operación fluida y eficiente. Si tienes un ojo para los detalles y habilidades administrativas, este es tu equipo ideal.',
        attachmentId: null,
        authorId: null,
        tokens: 0,
        numUsers: 0,
        adminTeamId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }      
      
    ], {});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Teams', null, {});
  }
};