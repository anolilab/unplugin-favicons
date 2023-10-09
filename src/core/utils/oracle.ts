import parseAuthor from "parse-author";
import type { NormalizedPackageJson } from "read-pkg-up";
import { readPackageUpSync } from "read-pkg-up";

type StringOrUndefined = string | undefined;

export default class Oracle {
    private packageJson: NormalizedPackageJson | undefined;

    public constructor(startingPath?: string) {
        try {
            const readPackage = readPackageUpSync({ cwd: startingPath });

            this.packageJson = readPackage?.packageJson;
        } catch {
            /* empty */
        }
    }

    /**
     * Tries to guess the name from package.json
     */
    public guessAppName(): StringOrUndefined {
        return this.packageJson?.name;
    }

    /**
     * Tries to guess the description from package.json
     */
    public guessDescription(): StringOrUndefined {
        return this.packageJson?.description;
    }

    /**
     * Tries to guess the developer {name, email, url} from package.json
     */
    public guessDeveloper(): { email?: StringOrUndefined; name?: StringOrUndefined; url?: StringOrUndefined } {
        if (this.packageJson?.author !== undefined) {
            if (typeof this.packageJson.author === "string") {
                return parseAuthor(this.packageJson.author);
            }

            if (typeof this.packageJson.author === "object" && this.packageJson.author !== null) {
                return {
                    email: this.packageJson.author?.email,
                    name: this.packageJson.author.name,
                    url: this.packageJson.author?.url,
                };
            }
        }

        if (this.packageJson?.maintainers !== undefined && Array.isArray(this.packageJson.maintainers) && this.packageJson.maintainers.length > 0) {
            const maintainer = this.packageJson.maintainers[0];

            if (typeof maintainer === "string") {
                return parseAuthor(maintainer);
            }

            if (typeof maintainer === "object" && maintainer !== null) {
                return {
                    email: maintainer?.email,
                    name: maintainer.name,
                    url: maintainer?.url,
                };
            }
        }

        return {
            email: undefined,
            name: undefined,
            url: undefined,
        };
    }

    /**
     * Tries to guess the version from package.json
     */
    public guessVersion(): StringOrUndefined {
        return this.packageJson?.version;
    }
}
