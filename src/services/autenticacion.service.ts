import { /* inject, */ BindingScope, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Llaves} from '../config/llaves';
import {Persona} from '../models';
import {PersonaRepository} from '../repositories';
const generador = require("password-generator"); //autenticacion.service debajo del primer import
const cryptoJS = require("crypto-js"); //referencia a la liberia de encriptar clave
const jwt = require("jsonwebtoken");  //referencia a la liberia de generar token

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(PersonaRepository)
    public personaRepository: PersonaRepository,
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService
  ) { }

  /*
   * Add service methods here
   */
  //generar clave aleatoria con cantidad de caracteres y nivel de dificultad.
  GenerarClave() {
    let clave = generador(8, false);
    return clave;
  }

  //cifrar la claveingresada recibe como parametro la clave generada.
  CifrarClave(clave: string) {
    let claveCifrada = cryptoJS.MD5(clave).toString();
    return claveCifrada;
  }

  //Autenticación
  IdentificarPersona(usuario: string, clave: string) {
    try {
      let p = this.personaRepository.findOne({where: {correo: usuario, clave: clave}});
      if (p) {
        return p;

      }
      return false;
    } catch {
      return false;
    }
  }

  GenerarTokenJWT(persona: Persona) {
    let token = jwt.sign({
      data: {
        id: persona.id,
        correo: persona.correo,
        nombre: persona.nombres + " " + persona.apellidos//,
        //rol: persona.rol = administrador
      }
    }, Llaves.claveJWT);
    return token;

  }


  ValidarTokenJWT(token: String) {
    try {
      let datos = jwt.verify(token, Llaves.claveJWT);
      return datos;
    } catch {
      return false;

    }

  }



}
