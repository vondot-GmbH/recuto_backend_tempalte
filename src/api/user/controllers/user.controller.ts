import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UserService } from '../services/user.service';
import { UserProtection } from 'src/schemas/user/user.schema';
import { UpdateUserDto } from 'src/dtos/user/update.user.dto';
import { JwtAuthenticationGuard } from 'src/guards/jwt.authentication.guard';

// documentation
@ApiTags('users')
@ApiBearerAuth('JWT')
//
// @UseGuards(JwtAuthenticationGuard) // TODO wenn die JWT logik aufgesetzt ist kann auch mit hilfe von Guards die authentication durchgeführt werden
// TODO diese Guards können auf Controller oder auf einzelne Routen angewendet werden (@nestjs/passport)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //! GET USER / ME

  // documentation
  @ApiCreatedResponse({ description: 'Resource successfully returned.' })
  @ApiForbiddenResponse({ description: 'Forbidden resource.' })
  @ApiOperation({
    summary: 'Returns the logged in user.',
  })
  //
  //
  @Get('/me')
  async getUser(@Req() req: Request): Promise<any> {
    // TODO hier als beispiel wie die CRUD service funktioniert und wie die protection und populate mitgegeben werden kann
    return await this.userService.findOne({
      conditions: { email: 'test@test.at' },
      projection: UserProtection.DEFAULT(),
      // populate: UserPopulate.DEFAULT(), // TODO das sollt nur als Beispiel dienen
      options: {},
    });
  }

  //! UPDATE USER / ME

  // documentation
  @ApiCreatedResponse({ description: 'Successfully udated.' })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @ApiForbiddenResponse({ description: 'Forbidden resource.' })
  @ApiOperation({
    summary: 'Update the logged in user.',
  })
  //
  //
  @Put('/me')
  async updateUserMe(
    @Body() updateUserDto: UpdateUserDto, // TODO hier die DTO die die validation durchführt und definiert welche daten mitgegeben werden müssen und welches format sie haben müssen
    @Req() req: Request,
  ): Promise<any> {
    // TODO hier als beispiel wenn daten vom client mitgegeben werden. Durch die DTO wird die validation automatisch durchgeführt und falls die daten nicht valide sind wird ein 400 zurückgegeben bevor der controller überhaupt aufgerufen wird
    return await this.userService.updateOne({
      conditions: { email: 'test@test.at' },
      changes: updateUserDto,
      projection: UserProtection.DEFAULT(),
      // populate: UserPopulate.DEFAULT(), // TODO das sollt nur als Beispiel dienen
      options: {},
    });
  }
}
