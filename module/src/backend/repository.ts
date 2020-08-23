// @ts-ignore
import * as sdk from 'botpress/sdk'

export default class InstallationRepository {
    private readonly knex: any
    private readonly table: string;

    constructor(private bp: typeof sdk) {
        this.knex = bp.database
        this.table = 'slack_tokens'
    }

    initialize() {
        if (!this.knex)
            throw new Error('You must initialize the database before')

        this.knex.createTableIfNotExists(this.table, function (table) {
            table.string('team').primary()
            table.json('installation')
            table.timestamps(true, true)
        })
    }

    async saveInstallation({team, installation}) {
        const data = {
            team: team,
            installation: installation
        }

        if (await this.getInstallation({team})) {
            return this.knex(this.table)
                .where({team})
                .update({
                    ...data,
                    updated_at: this.knex.fn.now()
                });
        }
        return this.knex(this.table).insert(data);
    }

    getInstallation({team}) {
        return this.knex(this.table)
            .where({team})
            .select('installation')
            .first()
    }
}
