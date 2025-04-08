import type { Control, UseFormGetValues, UseFormSetValue } from "react-hook-form"
import type { UserFormData } from "~/lib/schema/users.schema"
import { CompanyLocationList } from "../CompanyLocationList"
import { FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form"

interface CompanyLocationFields {
    control: Control<UserFormData>
    getValues: UseFormGetValues<UserFormData>
    setValue: UseFormSetValue<UserFormData>
}

export function CompanyLocationFields({ control, getValues, setValue }: CompanyLocationFields) {
    return (
        <div>
            <FormField
                control={control}
                name="companyLocations"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <CompanyLocationList
                                {...field}
                                isEdit={false}
                                customerId={''}
                                companyContactId={''}
                                isCreate={true}
                                locationList={[]}
                                getValues={getValues}
                                setValue={setValue}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

        </div>
    )
}